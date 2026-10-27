---
title: Windows forms, tips and trix – Buttons
date: 2012-05-18T13:07:36+02:00
modified: 2012-08-09T13:03:28+02:00
slug: windows-forms-button-tips-and-trix
permalink: /2012/05/18/windows-forms-button-tips-and-trix/
wpId: 93
description: Ever written a GUI to your application? Ever think there are alot of unnecessary lines? Here is a smart way to add basic buttons without too many lines. function CreateButton{ param( $name, $text, $size, $location, $onclick, $Form ) $name = New-Object System.Windows.Forms.Button $name.Text = “$text” $name.Location = “$location” $name.Size = “$size” $name.add_Click($onclick) $Form.Controls.Add($name) } This requires
categories: []
tags: []
author: freakling
---

Ever written a GUI to your application? Ever think there are alot of unnecessary lines?  
Here is a smart way to add basic buttons without too many lines.

```powershell
function CreateButton{
  param(
    $name,
    $text,
    $size,
    $location,
    $onclick,
    $Form
  )
  $name = New-Object System.Windows.Forms.Button
  $name.Text = "$text"
  $name.Location = "$location"
  $name.Size = "$size"
  $name.add_Click($onclick)
  $Form.Controls.Add($name)
}
```

This requires a specific type of code to be run on click. We declare a variable as code within curlybrackets as shown below. In this case we use System.Windows.Forms.SaveFileDialog and save a richtextbox named $consolewindow.

```powershell
$SaveButton_Click = {
  $SaveFileDialog = New-Object System.Windows.Forms.SaveFileDialog
  $SaveFileDialog.Filter = "txt files (*.txt)|*.txt|All files (*.*)|*.*"
  $SaveFileDialog.ShowDialog()
  $ConsoleWindow.Text | Out-File $SaveFileDialog.FileName
  $SaveFileDialog.Dispose()
}
```

To add a button with this information we need to create a main form and the console window with the code below.

```powershell
[Void][Reflection.Assembly]::LoadWithPartialName("System.Windows.Forms")

# Main form settings
$Form = New-Object System.Windows.Forms.Form
$Form.ClientSize = "1000,620"
$Form.DesktopLocation = "100,100"
$Form.MaximizeBox = $False
$Form.ShowIcon = $False
$Form.FormBorderStyle = "FixedSingle"
$Form.Name = "Example"
$Form.Text = "Example"

# Console window settings
$ConsoleWindow = New-Object System.Windows.Forms.RichTextBox
$ConsoleWindow.Size = "1000,250"
$ConsoleWindow.Location = "0,320"
#$ConsoleWindow.ReadOnly = $True #commented out for manual input.
$ConsoleWindow.BackColor = "Black"
$ConsoleWindow.ForeColor = "White"
$Form.Controls.Add($Consolewindow)
```

I’ve added a few extra rows just to make it look good for the example.  
Now let’s create a button

```
CreateButton -name "SaveButton" -text "Save to file" -size "100,30" -location "50,50" -form $form -onclick $SaveButton_Click
```

Then we load the forms window

```
$Form.ShowDialog()
```

Normally you might not have a use for this function but when creating dynamic buttons you could have a use for it. To create a range of buttons from an array, use something like this.

```powershell
$x = 0
$y = 0
for($i=0; $i -lt 20;$i++){
  CreateButton -name $Buttons[$i] -text $Buttons[$i] -size "100,30" -location "$x,$y" -form $form -onclick $Button_Click[$i]
  $x += 100
  if($x -gt "900"){$y += 30;$x = 0}
}
```

This example takes the first 20 from an array and puts them on the main form in a orderly fashion as to not overcrowd the main window. The example has no practical use, but you could extract nestled objects and create dynamic buttons with a bit of work.

The full script would look like this:  
Note that i’m using the same function for all buttons.

```powershell
function CreateButton{
  param(
    $name,
    $text,
    $size,
    $location,
    $onclick,
    $Form
  )
  $name = New-Object System.Windows.Forms.Button
  $name.Text = "$text"
  $name.Location = "$location"
  $name.Size = "$size"
  $name.add_Click($onclick)
  $Form.Controls.Add($name)
}
$SaveButton_Click = {
  $SaveFileDialog = New-Object System.Windows.Forms.SaveFileDialog
  $SaveFileDialog.Filter = "txt files (*.txt)|*.txt|All files (*.*)|*.*"
  $SaveFileDialog.ShowDialog()
  $ConsoleWindow.Text | Out-File $SaveFileDialog.FileName
  $SaveFileDialog.Dispose()
}
[Void][Reflection.Assembly]::LoadWithPartialName("System.Windows.Forms")

# Main form settings
$Form = New-Object System.Windows.Forms.Form
$Form.ClientSize = "1000,620"
$Form.DesktopLocation = "100,100"
$Form.MaximizeBox = $False
$Form.ShowIcon = $False
$Form.FormBorderStyle = "FixedSingle"
$Form.Name = "Example"
$Form.Text = "Example"

# Console window settings
$ConsoleWindow = New-Object System.Windows.Forms.RichTextBox
$ConsoleWindow.Size = "1000,250"
$ConsoleWindow.Location = "0,320"
#$ConsoleWindow.ReadOnly = $True #commented out for manual input.
$ConsoleWindow.BackColor = "Black"
$ConsoleWindow.ForeColor = "White"
$Form.Controls.Add($Consolewindow)

$Buttons = @("1".."26")
$x = 0
$y = 0
for($i=0; $i -lt 20;$i++){
  if($buttons[$i] -eq $null){break}
  CreateButton -name $Buttons[$i] -text $Buttons[$i] -size "100,30" -location "$x,$y" -form $form -onclick $SaveButton_Click
  $x += 100
  if($x -gt "900"){$y += 30;$x = 0}
}

$Form.ShowDialog()
```
