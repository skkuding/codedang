print("Starting nested loops...")
total_iterations = 0
limit1 = 50
limit2 = 50
limit3 = 50
limit4 = 50

for i in range(limit1):
    for j in range(limit2):
        for k in range(limit3):
            for l in range(limit4):
                total_iterations += 1
                if total_iterations % 1000000 == 0:
                    pass  # 가끔씩만 무언가 수행

print(f"Finished nested loops after {total_iterations} iterations.")
