package testcase

import (
	"context"
	"errors"
	"testing"

	"github.com/skkuding/codedang/apps/iris/src/loader"
	"github.com/stretchr/testify/require"
)

type stubObjectReader struct {
	get func(string) ([]loader.ElementOut, error)
}

func (s stubObjectReader) Get(key string) ([]loader.ElementOut, error) {
	return s.get(key)
}

type stubTestcaseDatabase struct {
	get func(context.Context, string, loader.ElementType) ([]loader.ElementOut, error)
}

func (s stubTestcaseDatabase) Get(ctx context.Context, key string, kind loader.ElementType) ([]loader.ElementOut, error) {
	return s.get(ctx, key, kind)
}

func (stubTestcaseDatabase) Save(context.Context, []loader.ElementIn) error {
	panic("unexpected Save call")
}

func TestGetTestcase_S3(t *testing.T) {
	public := loader.ElementOut{Id: 10, In: "1 2\n", Out: "3\n", Hidden: false}
	hidden := loader.ElementOut{Id: 20, In: "3 4\n", Out: "7\n", Hidden: true}
	mixed := []loader.ElementOut{hidden, public}

	for _, tt := range []struct {
		name   string
		filter TestcaseFilterCode
		data   []loader.ElementOut
		want   []loader.ElementOut
	}{
		{name: "all", filter: ALL, data: mixed, want: mixed},
		{name: "public only", filter: PUBLIC_ONLY, data: mixed, want: []loader.ElementOut{public}},
		{name: "hidden only", filter: HIDDEN_ONLY, data: mixed, want: []loader.ElementOut{hidden}},
		{name: "no public matches", filter: PUBLIC_ONLY, data: []loader.ElementOut{hidden}},
		{name: "no hidden matches", filter: HIDDEN_ONLY, data: []loader.ElementOut{public}},
		{name: "empty success", filter: ALL},
	} {
		t.Run(tt.name, func(t *testing.T) {
			s3Calls := 0
			manager := &testcaseManager{
				s3reader: stubObjectReader{get: func(key string) ([]loader.ElementOut, error) {
					s3Calls++
					require.Equal(t, "42", key)
					return tt.data, nil
				}},
				database: stubTestcaseDatabase{get: func(context.Context, string, loader.ElementType) ([]loader.ElementOut, error) {
					t.Fatal("database must not be queried after S3 succeeds")
					return nil, nil
				}},
			}

			got, err := manager.GetTestcase(context.Background(), "42", tt.filter)

			require.NoError(t, err)
			require.Equal(t, Testcase{Elements: tt.want}, got)
			require.Equal(t, 1, s3Calls)
		})
	}
}

func TestGetTestcase_DatabaseFallback(t *testing.T) {
	public := loader.ElementOut{Id: 10, In: "1 2\n", Out: "3\n", Hidden: false}
	hidden := loader.ElementOut{Id: 20, In: "3 4\n", Out: "7\n", Hidden: true}

	for _, tt := range []struct {
		name   string
		filter TestcaseFilterCode
		kind   loader.ElementType
		data   []loader.ElementOut
	}{
		{name: "all", filter: ALL, kind: loader.ALL, data: []loader.ElementOut{public, hidden}},
		{name: "public only", filter: PUBLIC_ONLY, kind: loader.PUBLIC_ONLY, data: []loader.ElementOut{public}},
		{name: "hidden only", filter: HIDDEN_ONLY, kind: loader.HIDDEN_ONLY, data: []loader.ElementOut{hidden}},
	} {
		t.Run(tt.name, func(t *testing.T) {
			ctx, cancel := context.WithCancel(context.Background())
			defer cancel()
			var calls []string
			manager := &testcaseManager{
				s3reader: stubObjectReader{get: func(key string) ([]loader.ElementOut, error) {
					calls = append(calls, "s3")
					require.Equal(t, "42", key)
					return []loader.ElementOut{{Id: 99}}, errors.New("S3 failed")
				}},
				database: stubTestcaseDatabase{get: func(gotCtx context.Context, key string, kind loader.ElementType) ([]loader.ElementOut, error) {
					calls = append(calls, "database")
					require.Same(t, ctx, gotCtx)
					require.Equal(t, "42", key)
					require.Equal(t, tt.kind, kind)
					return tt.data, nil
				}},
			}

			got, err := manager.GetTestcase(ctx, "42", tt.filter)

			require.NoError(t, err)
			require.Equal(t, Testcase{Elements: tt.data}, got)
			require.Equal(t, []string{"s3", "database"}, calls)
		})
	}
}

func TestGetTestcase_DatabaseError(t *testing.T) {
	s3Err := errors.New("S3 failed")
	dbErr := errors.New("database failed")
	var calls []string
	manager := &testcaseManager{
		s3reader: stubObjectReader{get: func(key string) ([]loader.ElementOut, error) {
			calls = append(calls, "s3")
			require.Equal(t, "42", key)
			return nil, s3Err
		}},
		database: stubTestcaseDatabase{get: func(_ context.Context, key string, kind loader.ElementType) ([]loader.ElementOut, error) {
			calls = append(calls, "database")
			require.Equal(t, "42", key)
			require.Equal(t, loader.ALL, kind)
			return []loader.ElementOut{{Id: 10}}, dbErr
		}},
	}

	got, err := manager.GetTestcase(context.Background(), "42", ALL)

	require.ErrorIs(t, err, dbErr)
	require.NotErrorIs(t, err, s3Err)
	require.EqualError(t, err, "GetTestcase: database failed")
	require.Equal(t, Testcase{}, got)
	require.Equal(t, []string{"s3", "database"}, calls)
}

func TestGetTestcase_Invalid_TestcaseFilter(t *testing.T) {
	s3Err := errors.New("S3 failed")

	t.Run("s3 success", func(t *testing.T) {
		var calls []string
		manager := &testcaseManager{
			s3reader: stubObjectReader{get: func(key string) ([]loader.ElementOut, error) {
				calls = append(calls, "s3")
				require.Equal(t, "42", key)
				return []loader.ElementOut{{Id: 99}}, nil
			}},
		}

		got, err := manager.GetTestcase(context.Background(), "42", TestcaseFilterCode(3))

		require.NotErrorIs(t, err, s3Err)
		require.EqualError(t, err, "invalid TestcaseFilter: 3")
		require.Equal(t, Testcase{}, got)
		require.Equal(t, []string{"s3"}, calls)
	})

	t.Run("s3 fallback", func(t *testing.T) {
		var calls []string
		manager := &testcaseManager{
			s3reader: stubObjectReader{get: func(key string) ([]loader.ElementOut, error) {
				calls = append(calls, "s3")
				require.Equal(t, "42", key)
				return nil, s3Err
			}},
		}

		got, err := manager.GetTestcase(context.Background(), "42", TestcaseFilterCode(3))

		require.NotErrorIs(t, err, s3Err)
		require.EqualError(t, err, "invalid TestcaseFilter: 3")
		require.Equal(t, Testcase{}, got)
		require.Equal(t, []string{"s3"}, calls)
	})
}
