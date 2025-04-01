from argparse import ArgumentParser, FileType

if __name__ == "__main__":
    parser = ArgumentParser(description="Scripts for personal workflows written in Python")
    parser.add_argument("--alphabet", help="JSON file with sign alphabets", default="data/sign-alphabets.json", type=FileType("r"))
    args = parser.parse_args()
    
    print(args)