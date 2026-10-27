---
title: Hotfix browser
date: 2014-03-31T17:02:56+02:00
modified: 2017-11-30T08:28:29+01:00
slug: hotfix-browser
permalink: /2014/03/31/hotfix-browser/
wpId: 470
description: "#Requires -version 2 [CmdletBinding()] Param($min,$max) Begin{ $MyPath = Split-Path $MyInvocation.MyCommand.path -Parent Function SaveFileDialog{ Param( [Parameter(Mandatory=$True)] $Filetype ) [Void][Reflection.Assembly]::LoadWithPartialName(“System.Windows.Forms”) $SaveFileDialog = New-Object System.Windows.Forms.SaveFileDialog $SaveFileDialog.Filter = “$Filetype files (*.$Filetype)|*.$Filetype|All files (*.*)|*.*” $status = $SaveFileDialog.ShowDialog() If($status -eq “Cancel”){$Return = $status} Else{$Return = $SaveFileDialog.FileName} $SaveFileDialog.Dispose() Return $Return } Function Call-Form{ [reflection.assembly]::loadwithpartialname(“System.Windows.Forms”) | Out-Null [reflection.assembly]::loadwithpartialname(“System.Drawing”) | Out-Null $EditMode = $False"
categories: []
tags: []
author: freakling
---

```powershell
#Requires -version 2
[CmdletBinding()]
Param($min,$max)
Begin{
    $MyPath = Split-Path $MyInvocation.MyCommand.path -Parent

    Function SaveFileDialog{
    Param(
        [Parameter(Mandatory=$True)]
        $Filetype
    )
        [Void][Reflection.Assembly]::LoadWithPartialName("System.Windows.Forms")
        $SaveFileDialog = New-Object System.Windows.Forms.SaveFileDialog
        $SaveFileDialog.Filter = "$Filetype files (*.$Filetype)|*.$Filetype|All files (*.*)|*.*"
        $status = $SaveFileDialog.ShowDialog()

        If($status -eq "Cancel"){$Return = $status}
        Else{$Return = $SaveFileDialog.FileName}

        $SaveFileDialog.Dispose()
        Return $Return
    }

    Function Call-Form{
        [reflection.assembly]::loadwithpartialname("System.Windows.Forms") | Out-Null
        [reflection.assembly]::loadwithpartialname("System.Drawing") | Out-Null
        $EditMode = $False
        $savepath = "$MyPath\SavedSearches.xml"

        ### MAINFORM
        $form1 = New-Object System.Windows.Forms.Form
        $label7 = New-Object System.Windows.Forms.Label
        $label6 = New-Object System.Windows.Forms.Label
        $NotesSearch = New-Object System.Windows.Forms.TextBox
        $LinkSearch = New-Object System.Windows.Forms.TextBox
        $label5 = New-Object System.Windows.Forms.Label
        $label4 = New-Object System.Windows.Forms.Label
        $Progressbar = New-Object System.Windows.Forms.ProgressBar
        $DownloadSearch = New-Object System.Windows.Forms.ComboBox
        $label3 = New-Object System.Windows.Forms.Label
        $label2 = New-Object System.Windows.Forms.Label
        $label1 = New-Object System.Windows.Forms.Label
        $ReviewSearch = New-Object System.Windows.Forms.TextBox
        $AppliestoSearch = New-Object System.Windows.Forms.TextBox
        $ShortTextSearch = New-Object System.Windows.Forms.TextBox
        $KBIDsearch = New-Object System.Windows.Forms.TextBox
        $searchButton = New-Object System.Windows.Forms.Button
        $dataGrid = New-Object System.Windows.Forms.DataGridView
        $InitialFormWindowState = New-Object System.Windows.Forms.FormWindowState

        #SAVE FORM
        $saveForm = New-Object System.Windows.Forms.Form
        $saveBox = New-Object System.Windows.Forms.TextBox
        $SaveButton = New-Object System.Windows.Forms.Button
        $listView = New-Object System.Windows.Forms.ListView

        #LOAD FORM
        $loadForm = New-Object System.Windows.Forms.Form
        $loadBox = New-Object System.Windows.Forms.TextBox
        $loadButton = New-Object System.Windows.Forms.Button

        $searchButton_Click ={
            $Progressbar.Show()
            If($DownloadSearch.Text -eq "True"){
                $DL = "1"
            }
            Else{
                $DL = "0"
            }

            #Get values from fields
            $SearchValues = @{}
            $SearchValues.Add("KBID",$KBIDsearch.Text)
            $SearchValues.Add("ShortText",$ShortTextSearch.Text)
            $SearchValues.Add("Download",$DL)
            $SearchValues.Add("AppliesTo",$AppliestoSearch.Text)
            $SearchValues.Add("LastReviewed",$ReviewSearch.Text)
            $SearchValues.Add("Link",$LinkSearch.Text)
            $SearchValues.Add("Notes",$NotesSearch.Text)

            #Compile search query
            $Query = "Select KBID,ShortText,Download,AppliesTo,LastReviewed,Link,Notes FROM hotfix_primary WHERE Exist = 1"
            $SearchValues.Keys | ForEach-Object{
                If($SearchValues.$_ -ne ''){
                    $value = $SearchValues.$_
                    $Query = "$Query AND $_ LIKE `'$Value`'"
                }

            }
            Try{
                $Data = Get-SQLQuery $Query
                $dataGrid.Rows.Clear()
                $Data | ForEach-Object{
                    [datetime]$date = $_.LastReviewed
                    $lastReviewed = '{0:yyyy-MM-dd}' -f $Date
                    $dataGrid.Rows.Add($_.KBID,$_.ShortText,$_.Download,$_.AppliesTo,$lastReviewed,$_.Link,$_.Notes)
                }
            }
            Catch{}#Write-Error $_}
            $Progressbar.Hide()
        }

        $OnLoadForm_StateCorrection=
        {#Correct the initial state of the form to prevent the .Net maximized form issue
        	$form1.WindowState = $InitialFormWindowState
        }

        # Menu button clicks

        $toolEdit_Click = {
            If($EditMode -eq $False){
                $toolEdit.Checked = $True
                $EditMode = $True
                $MainMenu.Items.Add($editMenu) | out-null
                $datagrid.columns | ForEach-Object{$_.ReadOnly = $False}
            }
            Else{
                $toolEdit.Checked = $False
                $EditMode = $False
                $MainMenu.Items.Remove($editMenu) | out-null
                $datagrid.columns | ForEach-Object{$_.ReadOnly = $True}
            }
        }

        $fileExport_Click = {
            $File = SaveFileDialog -Filetype "csv"
            If($File -ne "Cancel"){
                $Progressbar.Show()
                "KBID,ShortText,Download,AppliesTo,LastReviewed,Link,Notes" | Out-File $File
                $dataGrid.Rows | ForEach-Object{
                    $Cells = $_.cells
                    $KBID = ($cells | Where-object{$_.OwningColumn.Name -eq "KBID"}).Value
                    $ShortText = ($cells | Where-object{$_.OwningColumn.Name -eq "ShortText"}).Value
                    $Download = ($cells | Where-object{$_.OwningColumn.Name -eq "Download"}).Value
                    $AppliesTo = ($cells | Where-object{$_.OwningColumn.Name -eq "AppliesTo"}).Value
                    $LastReviewed = ($cells | Where-object{$_.OwningColumn.Name -eq "LastReviewed"}).Value
                    $Link = ($cells | Where-object{$_.OwningColumn.Name -eq "Link"}).Value
                    $Notes = ($cells | Where-object{$_.OwningColumn.Name -eq "Notes"}).Value
                    If($KBID -ne $null){
                        "$KBID,$ShortText,$Download,$AppliesTo,$LastReviewed,$Link,$Notes" | Out-File $File -Append
                    }
                }
                $Progressbar.Hide()
            }
        }

        $toolClear_Click = {
            $dataGrid.Rows.Clear()

            $KBIDsearch.Text = ''
            $ShortTextSearch.Text = ''
            $DownloadSearch.Text = "True"
            $AppliestoSearch.Text = ''
            $ReviewSearch.Text = ''
            $LinkSearch.Text = ''
            $NotesSearch.Text = ''
        }

        $toolSave_Click = {
            .$saveloadOnLoad
            $saveForm.Controls.Add($listView)
            $saveForm.ShowDialog()| Out-Null
        }
        $toolLoad_Click = {
            .$saveloadOnLoad
            $loadForm.Controls.Add($listView)
            $loadForm.ShowDialog()| Out-Null
        }

        $fileQuit_Click = {
            $form1.Close()
        }

        $SaveButton_OnClick = {
            $new = $saves.CreateElement('Save')
            $Name = $SaveBox.Text
            $new.SetAttribute('Name',"$($SaveBox.Text)")
            $new.SetAttribute('Query',"$Query")
            Try{($saves.SavedSearches.Save | Where-Object{$_.Name -eq $Name}).RemoveAll()}Catch{}
            $saves.SavedSearches.AppendChild($new)
            $saves.Save($savepath)
            #clean up bad elements
            [xml]$Clean = Get-Content $savepath | Where-Object{($_ -NotMatch '<Save />') -or ($_ -NotMatch 'Save Name=""')}
            $Clean.Save($savepath)
            $saveForm.Controls.Remove($listView)
            $saveForm.Close()
        }
        $LoadButton_OnClick = {
            $Query = ($saves.SavedSearches.Save | Where-object {$_.Name -Match "$($loadBox.Text)"}).Query
            $loadForm.Controls.Remove($listView)
            $loadForm.Close()
            $Progressbar.Show()
            $KBIDsearch.Text = ''
            $ShortTextSearch.Text = ''
            $DownloadSearch.Text = "True"
            $AppliestoSearch.Text = ''
            $ReviewSearch.Text = ''
            $LinkSearch.Text = ''
            $NotesSearch.Text = ''
            Try{
                $Data = Get-SQLQuery $Query
                $dataGrid.Rows.Clear()
                $Data | ForEach-Object{
                    [datetime]$date = $_.LastReviewed
                    $lastReviewed = '{0:yyyy-MM-dd}' -f $Date
                    $dataGrid.Rows.Add($_.KBID,$_.ShortText,$_.Download,$_.AppliesTo,$lastReviewed,$_.Link,$_.Notes)
                }
            }
            Catch{Write-Error $_}
            $Progressbar.Hide()
        }

        $listView_OnSelected = {
            $SaveBox.Text = $listView.SelectedItems[0].Text
            $loadBox.Text = $listView.SelectedItems[0].Text
        }

        $saveloadOnLoad = {
            $loadBox.Text = ''
            $SaveBox.Text = ''
            $listView.Items.Clear()
            [xml]$Clean = Get-Content $savepath | Where-Object{($_ -NotMatch '<Save />') -or ($_ -NotMatch 'Save Name=""')}
            $Clean.Save($savepath)
            $saves = [xml](Get-Content $savepath)
            $saves.SavedSearches.Save | ForEach-Object{
                $listView.Items.Add("$($_.Name)")|Out-Null
            }
        }

        $editClear_Click = {
            $new = "<?xml version=`"1.0`" encoding=`"utf-8`"?>`r`n<SavedSearches Description=`"All saved searches are nodes under this one`">`r`n</SavedSearches>"
            $new | out-file $savepath
        }

        $editUpdate_Click = {

            $dataGrid.Rows | ForEach-Object{
                $Cells = $_.cells
                $KBID = ($cells | Where-object{$_.OwningColumn.Name -eq "KBID"}).Value
                If($KBID -ne $null){
                    $ShortText = ($cells | Where-object{$_.OwningColumn.Name -eq "ShortText"}).Value
                    $Download = ($cells | Where-object{$_.OwningColumn.Name -eq "Download"}).Value
                    $AppliesTo = ($cells | Where-object{$_.OwningColumn.Name -eq "AppliesTo"}).Value
                    [Datetime]$LastReviewed = ($cells | Where-object{$_.OwningColumn.Name -eq "LastReviewed"}).Value
                    $Link = ($cells | Where-object{$_.OwningColumn.Name -eq "Link"}).Value
                    $Notes = ($cells | Where-object{$_.OwningColumn.Name -eq "Notes"}).Value

                    $Columns = "KBID","ShortText","Download","AppliesTo","LastReviewed","Link","Notes"
                    $Values = "`'$KBID`'","`'$ShortText`'","`'$Download`'","`'$AppliesTo`'","`'$LastReviewed`'","`'$Link`'","`'$Notes`'"
                    $UpdateCMD = "UPDATE hotfix_primary SET $($c = $Columns.count;(1..($c-1) | ForEach-Object{"$($Columns[$_]) = $($Values[$_])"}) -Join ',') WHERE KBID = `'$KBID`';"
                    Process-SQLCmd $UpdateCMD
                }
            }

        }

        #----------------------------------------------
        #region Generated Form Code
        $form1.ClientSize = "853,485"
        $form1.DataBindings.DefaultDataSourceUpdateMode = 0
        $form1.Text = "KB article browser"
        ### Main Menu Settings
        $MainMenu = new-object System.Windows.Forms.MenuStrip
        $MainMenu.Location = "0,0"
        $MainMenu.Name = "MainMenu"
        $MainMenu.Size = "1000,620"
        $MainMenu.TabIndex = 0
        $MainMenu.Text = "Main Menu"

        ## File Menu settings
        $fileMenu = new-object System.Windows.Forms.ToolStripMenuItem('&fileMenu')
        $fileMenu.Size = "35,20"
        $fileMenu.Text = "File"

        # Quit button
        $fileQuit = new-object System.Windows.Forms.ToolStripMenuItem('&Quit')
        $fileQuit.add_Click($fileQuit_Click)
        # Save button
        $fileExport = new-object System.Windows.Forms.ToolStripMenuItem('&Export list to CSV')
        $fileExport.Add_Click($fileExport_Click)

        # Add to file menu
        $fileMenu.DropDownItems.Add($fileExport) | out-null
        $fileMenu.DropDownItems.Add($fileQuit) | out-null

        ## Tool Menu settings
        $toolMenu = new-object System.Windows.Forms.ToolStripMenuItem('&toolMenu')
        $toolMenu.Size = "35,20"
        $toolMenu.Text = "Tools"

        $toolSave = new-object System.Windows.Forms.ToolStripMenuItem('&Save search')
        $toolSave.add_Click($toolSave_Click)

        # Copy button
        $toolLoad = new-object System.Windows.Forms.ToolStripMenuItem('&Load search')
        $toolLoad.add_Click($toolLoad_Click)

        # Copy button
        $toolEdit = new-object System.Windows.Forms.ToolStripMenuItem('&Edit mode')
        $toolEdit.add_Click($toolEdit_Click)

        # Clear button
        $toolClear = new-object System.Windows.Forms.ToolStripMenuItem('&Clear/Reset')
        $toolClear.add_Click($toolClear_Click)

        # Add to tool menu
        $toolMenu.DropDownItems.Add($toolSave) | out-null
        $toolMenu.DropDownItems.Add($toolLoad) | out-null
        $toolMenu.DropDownItems.Add($toolEdit) | out-null
        $toolMenu.DropDownItems.Add($toolClear) | out-null

        ## Edit Menu settings
        $editMenu = new-object System.Windows.Forms.ToolStripMenuItem('&editMenu')
        $editMenu.Size = "35,20"
        $editMenu.Text = "Edit"

        # Clear saved searches button
        $editClear = new-object System.Windows.Forms.ToolStripMenuItem('&Remove all saved searches')
        $editClear.add_Click($editClear_Click)

        # Update button
        $editUpdate = new-object System.Windows.Forms.ToolStripMenuItem('&Update database')
        $editUpdate.add_Click($editUpdate_Click)

        # Add to tool menu
        $editMenu.DropDownItems.Add($editUpdate) | out-null
        $editMenu.DropDownItems.Add($editClear) | out-null

        # Add main menu buttons
        $MainMenu.Items.Add($fileMenu) | out-null
        $MainMenu.Items.Add($toolMenu) | out-null

        $form1.Controls.Add($MainMenu) | out-null

        #######Searchboxes##########

        $NotesSearch.DataBindings.DefaultDataSourceUpdateMode = 0
        $NotesSearch.Location = "653,64"
        $NotesSearch.Name = "NotesSearch"
        $NotesSearch.Size = "93,20"
        $NotesSearch.TabIndex = 15

        $form1.Controls.Add($NotesSearch)

        $LinkSearch.DataBindings.DefaultDataSourceUpdateMode = 0
        $LinkSearch.Location = "553,64"
        $LinkSearch.Name = "LinkSearch"
        $LinkSearch.Size = "94,20"
        $LinkSearch.TabIndex = 14

        $form1.Controls.Add($LinkSearch)

        $DownloadSearch.DataBindings.DefaultDataSourceUpdateMode = 0
        $DownloadSearch.FormattingEnabled = $False
        $DownloadSearch.Items.Add("True")|Out-Null
        $DownloadSearch.Items.Add("False")|Out-Null
        $DownloadSearch.Location = "253,64"
        $DownloadSearch.Name = "DownloadSearch"
        $DownloadSearch.Size = "94,21"
        $DownloadSearch.TabIndex = 10
        $DownloadSearch.SelectedItem = "True"
        $DownloadSearch.DropDownStyle = 2

        $form1.Controls.Add($DownloadSearch)

        $ReviewSearch.DataBindings.DefaultDataSourceUpdateMode = 0
        $ReviewSearch.Location = "453,65"
        $ReviewSearch.Name = "ReviewSearch"
        $ReviewSearch.Size = "94,20"
        $ReviewSearch.TabIndex = 6

        $form1.Controls.Add($ReviewSearch)

        $AppliestoSearch.DataBindings.DefaultDataSourceUpdateMode = 0
        $AppliestoSearch.Location = "353,65"
        $AppliestoSearch.Name = "AppliestoSearch"
        $AppliestoSearch.Size = "94,20"
        $AppliestoSearch.TabIndex = 5

        $form1.Controls.Add($AppliestoSearch)

        $ShortTextSearch.DataBindings.DefaultDataSourceUpdateMode = 0
        $ShortTextSearch.Location = "153,65"
        $ShortTextSearch.MaxLength = 128
        $ShortTextSearch.Name = "ShortTextSearch"
        $ShortTextSearch.Size = "94,20"
        $ShortTextSearch.TabIndex = 3

        $form1.Controls.Add($ShortTextSearch)

        $KBIDsearch.DataBindings.DefaultDataSourceUpdateMode = 0
        $KBIDsearch.Location = "53,65"
        $KBIDsearch.MaxLength = 7
        $KBIDsearch.Name = "KBIDsearch"
        $KBIDsearch.Size = "94,20"
        $KBIDsearch.TabIndex = 2

        $form1.Controls.Add($KBIDsearch)

        $searchButton.Anchor = 9

        $searchButton.DataBindings.DefaultDataSourceUpdateMode = 0
        $searchButton.Location = "752,64"
        $searchButton.Name = "searchButton"
        $searchButton.Size = "88,21"
        $searchButton.TabIndex = 1
        $searchButton.Text = "Search"
        $searchButton.UseVisualStyleBackColor = $True
        $searchButton.add_Click($searchButton_Click)

        $form1.Controls.Add($searchButton)

        #####Labels and the rest#####

        $label7.DataBindings.DefaultDataSourceUpdateMode = 0

        $label7.Location = "653,43"
        $label7.Name = "label7"
        $label7.Size = "100,15"
        $label7.TabIndex = 17
        $label7.Text = "Notes"

        $form1.Controls.Add($label7)

        $label6.DataBindings.DefaultDataSourceUpdateMode = 0

        $label6.Location = "554,43"
        $label6.Name = "label6"
        $label6.Size = "100,14"
        $label6.TabIndex = 16
        $label6.Text = "Link"

        $form1.Controls.Add($label6)

        $label5.DataBindings.DefaultDataSourceUpdateMode = 0

        $label5.Location = "454,43"
        $label5.Name = "label5"
        $label5.Size = "93,18"
        $label5.TabIndex = 13
        $label5.Text = "Last Review Date"

        $form1.Controls.Add($label5)

        $label4.DataBindings.DefaultDataSourceUpdateMode = 0

        $label4.Location = "353,43"
        $label4.Name = "label4"
        $label4.Size = "94,15"
        $label4.TabIndex = 12
        $label4.Text = "AppliesTo"

        $form1.Controls.Add($label4)

        $Progressbar.DataBindings.DefaultDataSourceUpdateMode = 0
        $Progressbar.Location = "13,437"
        $Progressbar.Name = "Progressbar"
        $Progressbar.Size = "828,36"
        $Progressbar.Style = 2
        $Progressbar.TabIndex = 11
        $Progressbar.Anchor = 14

        $form1.Controls.Add($Progressbar)
        $Progressbar.Hide()

        $label3.DataBindings.DefaultDataSourceUpdateMode = 0

        $label3.Location = "253,43"
        $label3.Name = "label3"
        $label3.Size = "94,18"
        $label3.TabIndex = 9
        $label3.Text = "Hotfix available"

        $form1.Controls.Add($label3)

        $label2.DataBindings.DefaultDataSourceUpdateMode = 0

        $label2.Location = "153,44"
        $label2.Name = "label2"
        $label2.Size = "94,18"
        $label2.TabIndex = 8
        $label2.Text = "Short Text"

        $form1.Controls.Add($label2)

        $label1.DataBindings.DefaultDataSourceUpdateMode = 0
        $label1.Location = "53,44"
        $label1.Name = "label1"
        $label1.RightToLeft = 0
        $label1.Size = "94,18"
        $label1.TabIndex = 7
        $label1.Text = "KB ID"
        $label1.add_Click($handler_label1_Click)

        $form1.Controls.Add($label1)

        ####DATA GRID COLUMNS######

        $dataGrid.Anchor = 15
        $KBIDColumn = New-Object System.Windows.Forms.DataGridViewTextBoxColumn
        $KBIDColumn.HeaderText = "KB ID"
        $KBIDColumn.Name = "KBID"
        $KBIDColumn.ReadOnly = $True
        $KBIDColumn.Width = 100

        $dataGrid.Columns.Add($KBIDColumn)|Out-Null

        $ShortTextColumn = New-Object System.Windows.Forms.DataGridViewTextBoxColumn
        $ShortTextColumn.HeaderText = "Short Text"
        $ShortTextColumn.Name = "ShortText"
        $ShortTextColumn.ReadOnly = $True
        $ShortTextColumn.Width = 100

        $dataGrid.Columns.Add($ShortTextColumn)|Out-Null

        $DownloadColumn = New-Object System.Windows.Forms.DataGridViewTextBoxColumn
        $DownloadColumn.HeaderText = "Hotfix available"
        $DownloadColumn.Name = "Download"
        $DownloadColumn.ReadOnly = $True
        $DownloadColumn.Width = 100

        $dataGrid.Columns.Add($DownloadColumn)|Out-Null

        $AppliesToColumn = New-Object System.Windows.Forms.DataGridViewTextBoxColumn
        $AppliesToColumn.HeaderText = "Applies to"
        $AppliesToColumn.Name = "AppliesTo"
        $AppliesToColumn.ReadOnly = $True
        $AppliesToColumn.Width = 100

        $dataGrid.Columns.Add($AppliesToColumn)|Out-Null

        $DateColumn = New-Object System.Windows.Forms.DataGridViewTextBoxColumn
        $DateColumn.HeaderText = "Last Review date"
        $DateColumn.Name = "LastReviewed"
        $DateColumn.ReadOnly = $True
        $DateColumn.Width = 100

        $dataGrid.Columns.Add($DateColumn)|Out-Null

        $LinkColumn = New-Object System.Windows.Forms.DataGridViewTextBoxColumn
        $LinkColumn.HeaderText = "Link"
        $LinkColumn.Name = "Link"
        $LinkColumn.ReadOnly = $True
        $LinkColumn.Width = 100

        $dataGrid.Columns.Add($LinkColumn)|Out-Null

        $NotesColumn = New-Object System.Windows.Forms.DataGridViewTextBoxColumn
        $NotesColumn.HeaderText = "Notes"
        $NotesColumn.Name = "Notes"
        $NotesColumn.ReadOnly = $False
        $NotesColumn.Width = 100

        $dataGrid.Columns.Add($NotesColumn)|Out-Null

        $dataGrid.DataBindings.DefaultDataSourceUpdateMode = 0
        $dataGrid.Location = "12,91"
        $dataGrid.Name = "dataGrid"
        $dataGrid.Size = "828,382"
        $dataGrid.TabIndex = 0
        $dataGrid.add_CellContentClick($handler_dataGrid_CellContentClick)

        $form1.Controls.Add($dataGrid)

        #endregion Generated Form Code

        #Save the initial state of the form
        $InitialFormWindowState = $form1.WindowState
        #Init the OnLoad event to correct the initial state of the form
        $form1.add_Load($OnLoadForm_StateCorrection)

        ### SAVE SEARCH FORM SETTINGS
        $saveForm.ClientSize = "246,196"
        $saveForm.DataBindings.DefaultDataSourceUpdateMode = 0
        $saveForm.Name = "saveForm"
        $saveForm.Text = "Save current search"
        $form1.add_Load($saveloadOnLoad)

        $saveBox.Anchor = 14
        $saveBox.DataBindings.DefaultDataSourceUpdateMode = 0
        $saveBox.Location = "1,133"
        $saveBox.Name = "saveBox"
        $saveBox.Size = "245,20"
        $saveBox.TabIndex = 2

        $saveForm.Controls.Add($saveBox)

        $SaveButton.Anchor = 14

        $SaveButton.DataBindings.DefaultDataSourceUpdateMode = 0

        $SaveButton.Location = "1,159"
        $SaveButton.Name = "SaveButton"
        $SaveButton.Size = "245,38"
        $SaveButton.TabIndex = 1
        $SaveButton.Text = "Save"
        $SaveButton.UseVisualStyleBackColor = $True
        $SaveButton.add_Click($SaveButton_OnClick)

        $saveForm.Controls.Add($SaveButton)

        $listView.Anchor = 15
        $listView.DataBindings.DefaultDataSourceUpdateMode = 0
        $listView.Location = "1,1"
        $listView.Name = "listView"
        $listView.Size = "245,121"
        $listView.TabIndex = 0
        $listView.add_MouseClick($listView_OnSelected)
        #$listView.add_KeyPress($listView_OnDelete)
        $listView.View = 3

        ### LOAD SEARCH FORM SETTINGS
        $loadForm.ClientSize = "246,196"
        $loadForm.DataBindings.DefaultDataSourceUpdateMode = 0
        $loadForm.Name = "loadForm"
        $loadForm.Text = "Load current search"
        $form1.add_Load($saveloadOnLoad)

        $loadBox.Anchor = 14
        $loadBox.DataBindings.DefaultDataSourceUpdateMode = 0
        $loadBox.Location = "1,133"
        $loadBox.Name = "loadBox"
        $loadBox.Size = "245,20"
        $loadBox.TabIndex = 2

        $loadForm.Controls.Add($loadBox)

        $loadButton.Anchor = 14

        $loadButton.DataBindings.DefaultDataSourceUpdateMode = 0

        $loadButton.Location = "1,159"
        $loadButton.Name = "loadButton"
        $loadButton.Size = "245,38"
        $loadButton.TabIndex = 1
        $loadButton.Text = "load"
        $loadButton.UseVisualStyleBackColor = $True
        $loadButton.add_Click($loadButton_OnClick)

        $loadForm.Controls.Add($listView)
        $loadForm.Controls.Add($loadButton)

        #Show the Form
        If(!(Test-Path $savePath)){.$editClear_Click}
        $form1.ShowDialog()| Out-Null
    }

    Function Process-SQLCmd {
    Param(
        [Parameter(Mandatory=$true)]
        [String]$Command,
        [Parameter(Mandatory=$false)]
        [String]$ConnectionString = 'Server=LocalHost\SQL;Database=ClientMaintenance;Trusted_Connection=True;'
    )
        $connection = New-Object System.Data.SqlClient.SqlConnection
        $connection.ConnectionString = $ConnectionString
        $connection.Open()
        $cmd = New-Object System.Data.SQLClient.SQLCommand
        $cmd.Connection = $connection
        $cmd.CommandText = $Command
        Try{$cmd.ExecuteNonQuery()}
        Catch{
            If(!($_.Exception -match 'Violation of PRIMARY KEY constraint')){
                $_.Exception | Out-file "$Mypath\error.log" -append
                $command | Out-file "$Mypath\error.log" -append
            }
        }
        $connection.Close()
    }

    Function Get-SQLQuery{
    Param(
        [Parameter(Mandatory=$true)]
        [String]$SQLQuery,
        [Parameter(Mandatory=$false)]
        [String]$ConnectionString = 'Server=LocalHost\SQL;Database=ClientMaintenance;Trusted_Connection=True;'
    )
        $connection = New-Object System.Data.SqlClient.SqlConnection
        $connection.ConnectionString = "$ConnectionString"
        $connection.Open()
        $Command = New-Object System.Data.SQLClient.SQLCommand
        $Command.CommandTimeout = 300
        $Command.Connection = $Connection
        $Command.CommandText = $SQLQuery
        Try{
            $Reader = $Command.ExecuteReader()
            $Counter = $Reader.FieldCount

            $DataTable = New-Object system.Data.DataTable
            for($i = 0; $i -lt $counter; $i++){
                $Column = New-Object system.Data.DataColumn $Reader.GetName($i),([string])
                $DataTable.Columns.Add($Column)
            }

            while ($Reader.Read()) {
                $strData = @()
                for ($i = 0; $i -lt $Counter; $i++) {
                    $strData += [String]$Reader.GetValue($i)
                }
                $DataTable.Rows.Add($strData) | out-null
            }
            $Reader.Close()
            $Data = $Datatable
        }
        Catch{
            Write-Error $_
            $Data  = $_.Exception
        }
        Finally{
            $Connection.Close()
        }
        Return $Data
    }
}
Process{

    Call-Form
}
End{}
```
