data = []
i = 0
while True:
    data.append("A" * 1024)  # 1KB 문자열 추가
    i += 1
    print(f"List size: {len(data)} KB")  # 과도한 출력
