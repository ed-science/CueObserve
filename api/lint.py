import argparse
from pylint.lint import Run

# list all the files that changed for the current PR
# changedFilesCommand = """git --no-pager diff --name-only FETCH_HEAD $(git merge-base FETCH_HEAD development)"""


parser = argparse.ArgumentParser(prog="LINT")

parser.add_argument(
    "-p",
    "--path",
    help="path to directory you want to run pylint | "
    "Default: %(default)s | "
    "Type: %(type)s ",
    default="./src",
    type=str,
)

parser.add_argument(
    "-t",
    "--threshold",
    help="score threshold to fail pylint runner | "
    "Default: %(default)s | "
    "Type: %(type)s ",
    default=7,
    type=float,
)

args = parser.parse_args()
path = str(args.path)
threshold = float(args.threshold)

results = Run([path], do_exit=False)

final_score = (
    results.linter.stats["global_note"] if "global_note" in results.linter.stats else 0
)

if final_score < threshold:

    message = f"PyLint Failed | Score: {final_score} | Threshold: {threshold} "

    raise Exception(message)

else:
    message = f"PyLint Passed | Score: {final_score} | Threshold: {threshold} "

    exit(0)
