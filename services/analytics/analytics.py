import sys
import json

def calculate_mean(data):
    return sum(data) / len(data)

if __name__ == "__main__":
    data = json.loads(sys.argv[1])
    result = calculate_mean(data)
    print(result)
