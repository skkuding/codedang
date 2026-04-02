# consume both CPU and memory aggressively
data = []
while True:
    data.append('A' * (1024 * 1024))  # 1MB per iteration
