
import os

AGENTS_DIR = 'src/agents'
SDK_IMPORT = "@google/jules-sdk"

for filename in os.listdir(AGENTS_DIR):
    if filename.endswith(".ts"):
        filepath = os.path.join(AGENTS_DIR, filename)
        with open(filepath, 'r') as f:
            lines = f.readlines()

        new_lines = []
        skip_next_ignore = False

        for i, line in enumerate(lines):
            # Check if line already has @ts-ignore
            if "// @ts-ignore" in line:
                new_lines.append(line)
                continue

            # Check if it's the SDK import
            if SDK_IMPORT in line:
                # Check if previous line was ignore
                if i > 0 and "// @ts-ignore" in lines[i-1]:
                    new_lines.append(line)
                else:
                    new_lines.append("// @ts-ignore\n")
                    new_lines.append(line)
            else:
                new_lines.append(line)

        with open(filepath, 'w') as f:
            f.writelines(new_lines)
        print(f"Patched {filename}")
