---
title: SQL queries in powershell
date: 2012-11-06T13:17:11+01:00
modified: 2013-11-14T16:33:18+01:00
slug: sql-queries-in-powershell
permalink: /2012/11/06/sql-queries-in-powershell/
wpId: 162
description: I was trying to query the SCCM database and sort the results with Powershell to get a full report on all the connections to a collection. To do this i needed to inject a SELECT query and retrieve an object from the database which proved to be a bit difficult. Below is how i resolved
categories: []
tags: []
author: freakling
---

I was trying to query the SCCM database and sort the results with Powershell to get a full report on all the connections to a collection. To do this i needed to inject a SELECT query and retrieve an object from the database which proved to be a bit difficult. Below is how i resolved it.

To connect to a SQL you need a client, in powershell and .NET we have the [System.Data.SQLClient](http://msdn.microsoft.com/en-us/library/system.data.sqlclient.aspx) namespace

```powershell
$connection = New-Object System.Data.SqlClient.SqlConnection
```

Then i needed a connection string to open the database.

```
$connection.ConnectionString = "$ConnectionString"
$connection.Open()
```

Now we need to inject the command we want. Fairly simple, we create a SQLCommand and connect it to the already established connection.

```powershell
$Command = New-Object System.Data.SQLClient.SQLCommand
$Command.Connection = $Connection
```

Then we insert our command

```
$Command.CommandText = $SQLQuery
```

What we do after is execute the command and create a counter of the columns in the result.

```
$Reader = $Command.ExecuteReader()
$Counter = $Reader.FieldCount
```

Now we create the DataTable and use the counter to populate the columns. We name them after each column in the query.

```powershell
$DataTable = New-Object system.Data.DataTable
for($i = 0; $i -lt $counter; $i++){
    $Column = New-Object system.Data.DataColumn $Reader.GetName($i),([string])
    $DataTable.Columns.Add($Column)
}
```

While the Reader is active it processes a loop for the length of counter and ejects the results into new rows in the DataTable.  
To get the correct formatting, we place everything into a string and format accordingly. Name and value.  
We then use the Invoke-Expression cmdlet to execute the formatted string and add values to the rows

```powershell
while ($Reader.Read()) {
    $Data = @()
    for ($i = 0; $i -lt $Counter; $i++) {
        $Data += [String]$Reader.GetValue($i)
    }
    $DataTable.Rows.Add($Data)
}
```

Last but not least, we close the reader and the connection to the database and output the finished table

```
$Reader.Close()
$Connection.Close()

Return $DataTable
```

And we’re done!

The finished function will now look like this:

```powershell
Function Get-SQLQuery{
    Param(
        [Parameter(Mandatory=$true)]
        [String]$SQLQuery,
        [Parameter(Mandatory=$true)]
        [String]$ConnectionString
    )
    $connection = New-Object System.Data.SqlClient.SqlConnection
    $connection.ConnectionString = "$ConnectionString"
    $connection.Open()
    $Command = New-Object System.Data.SQLClient.SQLCommand
    $Command.Connection = $Connection
    $Command.CommandText = $SQLQuery
    $Reader = $Command.ExecuteReader()
    $Counter = $Reader.FieldCount

    $DataTable = New-Object system.Data.DataTable
    for($i = 0; $i -lt $counter; $i++){
        $Column = New-Object system.Data.DataColumn $Reader.GetName($i),([string])
        $DataTable.Columns.Add($Column)
    }

    while ($Reader.Read()) {
        $Data = @()
        for ($i = 0; $i -lt $Counter; $i++) {
            $Data += [String]$Reader.GetValue($i)
        }
        $DataTable.Rows.Add($Data)
    }
    $Reader.Close()
    $Connection.Close()

    Return $DataTable
}
```

First set your connectionstring and Select query then invoke the command like this:

```
Get-SQLQuery -ConnectionString $connectionstring -SQLQuery $SelectQuery
```

Examples of connectionstrings can be found at [Connectionstrings.com](http://www.connectionstrings.com/)  
The usual string is the trusted which uses your credentials

If you are using the function a lot, concider adding it to your Powershell profile. For more information check out my previous post on [WGET and profiles](/2012/05/03/wget-for-windows/ "WGET and profiles")
