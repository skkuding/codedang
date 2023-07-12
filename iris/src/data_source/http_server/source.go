package httpserver

import (
	"fmt"
	"io/ioutil"
	"net/http"
	"strings"
	"time"
)

type httpServerDataSource struct {
	url            string
	placeholder    string
	authToken      string
	authHeader     string
	requestTimeout time.Duration
}

func NewHttpServerDataSource(url, placeholder, authToken, authHeader string, requestTimeout time.Duration) *httpServerDataSource {
	return &httpServerDataSource{
		url:            url,
		placeholder:    placeholder,
		authToken:      authToken,
		authHeader:     authHeader,
		requestTimeout: requestTimeout,
	}
}

func (h *httpServerDataSource) Get(key string) ([]byte, error) {
	url := strings.Replace(h.url, h.placeholder, key, 1)
	fmt.Println(url)
	req, err := http.NewRequest("GET", url, nil)
	req.Header.Add(h.authHeader, h.authToken)
	if err != nil {
		return nil, fmt.Errorf("failed to create http request: %w", err)
	}

	// http.Client is not thread safe. Should create a new instance on every requst.
	client := &http.Client{Timeout: h.requestTimeout}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("http client error: %w", err)
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read the response body")
	}

	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("failed to get data from the server: statusCode: %d, data: %s", resp.StatusCode, string(body))
	}

	return body, nil
}
