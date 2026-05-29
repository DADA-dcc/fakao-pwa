$desktop = [Environment]::GetFolderPath('Desktop')
$shortcutPath = Join-Path $desktop '法考刷题助手.lnk'
$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut($shortcutPath)
$Shortcut.TargetPath = 'C:\Users\熊帅\falvkaoshi-bot\node_modules\electron\dist\electron.exe'
$Shortcut.Arguments = 'C:\Users\熊帅\falvkaoshi-bot'
$Shortcut.WorkingDirectory = 'C:\Users\熊帅\falvkaoshi-bot'
$Shortcut.IconLocation = 'C:\Users\熊帅\falvkaoshi-bot\node_modules\electron\dist\electron.exe,0'
$Shortcut.Save()
Write-Host "Shortcut created: $shortcutPath"
Write-Host "Target: electron.exe (direct)"
