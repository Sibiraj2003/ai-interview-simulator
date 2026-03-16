import subprocess
import tempfile
import json


def run_python_code(user_code, test_cases):

    results = []
    stdout_capture = ""

    for case in test_cases:

        script = f"""
{user_code}

try:
    result = solution(*{case["input"]})
    print(result)
except Exception as e:
    print("ERROR:", e)
"""

        with tempfile.NamedTemporaryFile(delete=False, suffix=".py") as f:
            f.write(script.encode())
            filename = f.name

        try:

            process = subprocess.run(
                ["python", filename],
                capture_output=True,
                text=True,
                timeout=5
            )

            output = process.stdout.strip()
            stdout_capture += output + "\\n"

        except Exception as e:
            output = str(e)

        expected = str(case["output"])

        passed = expected == output

        results.append({
            "input": case["input"],
            "expected": case["output"],
            "actual": output,
            "passed": passed
        })

    return {
        "results": results,
        "stdout": stdout_capture
    }