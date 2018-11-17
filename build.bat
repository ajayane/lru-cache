set mypath=%cd%
@echo "Running build"
node_modules\.bin\tsc -p "%mypath%\tsconfig.json"