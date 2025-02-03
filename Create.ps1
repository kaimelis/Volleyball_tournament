# Define the root directory
$rootDir = "volleyball-tournament"

# Define the folder structure
$folders = @(
    "$rootDir",
    "$rootDir/css",
    "$rootDir/js"
)

# Define the files to be created
$files = @(
    "$rootDir/index.html",
    "$rootDir/css/styles.css",
    "$rootDir/js/state.js",
    "$rootDir/js/templates.js",
    "$rootDir/js/tournament.js",
    "$rootDir/js/bracket.js",
    "$rootDir/js/ui.js",
    "$rootDir/README.md"
)

# Create folders
foreach ($folder in $folders) {
    if (!(Test-Path -Path $folder)) {
        New-Item -ItemType Directory -Path $folder | Out-Null
        Write-Host "Created folder: $folder"
    } else {
        Write-Host "Folder already exists: $folder"
    }
}

# Create files
foreach ($file in $files) {
    if (!(Test-Path -Path $file)) {
        New-Item -ItemType File -Path $file | Out-Null
        Write-Host "Created file: $file"
    } else {
        Write-Host "File already exists: $file"
    }
}

Write-Host "Project structure setup complete!"
