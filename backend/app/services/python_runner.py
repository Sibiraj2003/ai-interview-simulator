import subprocess
import tempfile
import json
import os


def run_python_code(user_code, test_cases):

    results = []
    stdout_capture = ""

    # ensure test_cases is list
    if isinstance(test_cases, str):
        try:
            test_cases = json.loads(test_cases)
        except:
            test_cases = []

    for case in test_cases:

        try:
            input_data = case.get("input")
            expected_output = case.get("output")

            # ensure JSON safe
            input_value = json.dumps(input_data)

            script = f"""
{user_code}

try:
    inp = {input_value}

    if isinstance(inp, (list, tuple)):
        result = solution(*inp)
    else:
        result = solution(inp)

    print(result)

except Exception as e:
    print("ERROR:", e)
"""

            with tempfile.NamedTemporaryFile(delete=False, suffix=".py") as f:
                f.write(script.encode())
                filename = f.name

            process = subprocess.run(
                ["python", filename],
                capture_output=True,
                text=True,
                timeout=5
            )

            output = process.stdout.strip()

            stdout_capture += output + "\\n"

            actual_output = output

            passed = str(expected_output).strip() == actual_output.strip()

            results.append({
                "input": input_data,
                "expected": expected_output,
                "actual": actual_output,
                "passed": passed
            })

        except Exception as e:

            results.append({
                "input": input_data,
                "expected": expected_output,
                "actual": str(e),
                "passed": False
            })

        finally:
            try:
                os.remove(filename)
            except:
                pass
    print("DEBUG RESULTS:", results)
    return {
        "results": results,
        "stdout": stdout_capture
    }