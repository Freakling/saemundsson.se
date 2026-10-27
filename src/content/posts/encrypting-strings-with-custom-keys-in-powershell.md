---
title: Encrypting strings with custom keys in powershell
date: 2015-04-01T16:50:01+02:00
modified: 2015-04-01T16:50:01+02:00
slug: encrypting-strings-with-custom-keys-in-powershell
permalink: /2015/04/01/encrypting-strings-with-custom-keys-in-powershell/
wpId: 554
description: Since the ConvertTo-SecureString is not really secure, and neither is the EncodedCommand (base64string) I made two short functions to encrypt and decrypt strings in order to send them across the void unharmed. Function Encrypt-String{ Param( [Parameter( Mandatory=$True, Position=0, ValueFromPipeLine=$true )] [Alias(“String”)] [String]$PlainTextString, [Parameter( Mandatory=$True, Position=1 )] [Alias(“Key”)] [byte[]]$EncryptionKey ) Try{ $secureString = Convertto-SecureString $PlainTextString -AsPlainText
categories: []
tags: []
author: freakling
---

Since the ConvertTo-SecureString is not really secure, and neither is the EncodedCommand (base64string) I made two short functions to encrypt and decrypt strings in order to send them across the void unharmed.

```powershell
Function Encrypt-String{
Param(

    [Parameter(
        Mandatory=$True,
        Position=0,
        ValueFromPipeLine=$true
    )]
    [Alias("String")]
    [String]$PlainTextString,

    [Parameter(
        Mandatory=$True,
        Position=1
    )]
    [Alias("Key")]
    [byte[]]$EncryptionKey
)
    Try{
        $secureString = Convertto-SecureString $PlainTextString -AsPlainText -Force
        $EncryptedString = ConvertFrom-SecureString -SecureString $secureString -Key $EncryptionKey

        return $EncryptedString
    }
    Catch{Throw $_}

}
```

this function accepts a string, a key and outputs the encryptedstring.

To encrypt call the function with a plaintext string and a key. the key must be a byte array with 16,24 or 32 bytes (128,192 or 256 bits)

Calling the function looks like this.

```
$string = @'
I am about to become encrypted!
'@

[Byte[]]$Key = 117,9,103,192,133,20,53,149,81,95,108,34,81,224,226,220,56,68,133,120,139,241,176,239,171,54,231,205,83,57,51,255

$EncryptedString = Encrypt-String -PlainTextString $string -Key $Key
```

The output becomes

```
PS> $encryptedString
76492d1116743f0423413b16050a5345MgB8AG8AVABnAGcAagArAFYAUgBoAGkAYwBOAFIAZgBTAGEAQQB1AGsAMQBmAHcAPQA9
AHwAZQBiADIAOAA4ADQAYwA5ADEAMABlAGMAOABmADUAOAAyAGIANQAzADIAOABjADIAOAAxADUAZgAxADYAMgAyAGQAMgA2AGUA
ZQA2ADYANAA2AGUAYQA0AGMAMgBmADMAYgAwADIAMgAxAGQAOQAxADcANwBhADgANwAxADcAZgBjADEANwAxADcANwA1ADgANwBh
ADMAMgA3AGEAMABmADcAYQAzADcAYQBiADgANAAwADkAOQA4ADgANgA1AGYAMwA5ADMANAA3ADkAZgAwAGIAZAA1AGQAZgA2AGEA
MABmADIANwBmADkANQBhAGYAOAAxAGYANgA0ADAAOAAxAA==
```

Now to the decrypt. This function needs the exact encryptedstring and the exact key that the string was encoded with.

```powershell
Function Decrypt-String{
Param(
    [Parameter(
        Mandatory=$True,
        Position=0,
        ValueFromPipeLine=$true
    )]
    [Alias("String")]
    [String]$EncryptedString,

    [Parameter(
        Mandatory=$True,
        Position=1
    )]
    [Alias("Key")]
    [byte[]]$EncryptionKey
)
    Try{
        $SecureString = ConvertTo-SecureString $EncryptedString -Key $EncryptionKey
        $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecureString)
        [string]$String = [Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)

        Return $String
    }
    Catch{Throw $_}

}
```

To call this function simply input the encryptedString and key and you get the pre-encrypted string as the return value.

```
PS> Decrypt-String -EncryptedString $EncryptedString -EncryptionKey $Key
I am about to become encrypted!
```

Both functions accept value by pipeline so a Get-content can be used like this.

```powershell
Get-Content C:\temp\encrypted.txt | Decrypt-String -EncryptionKey $Key
```

An overkill version of this is to double encode/encrypt. First convert the string to a base64 (encodedCommand style) then encode it with the key. This really adds no further security except to obfuscate the encrypted package and in case someone gets the key to decrypt they have to convert the encodedcommand to a string from base 64

```powershell
Function Encrypt-String{
Param(

    [Parameter(
        Mandatory=$True,
        Position=0,
        ValueFromPipeLine=$true
    )]
    [Alias("String")]
    [String]$PlainTextString,

    [Parameter(
        Mandatory=$True,
        Position=1
    )]
    [Alias("Key")]
    [byte[]]$EncryptionKey
)
    Try{
        $bytes = [System.Text.Encoding]::Unicode.GetBytes($PlainTextString)
        $encodedCommand = [Convert]::ToBase64String($bytes)
        $secureString = Convertto-SecureString $encodedCommand -AsPlainText -Force
        $EncryptedString = ConvertFrom-SecureString -SecureString $secureString -Key $EncryptionKey

        return $EncryptedString
    }
    Catch{Throw $_}

}

Function Decrypt-String{
Param(
    [Parameter(
        Mandatory=$True,
        Position=0,
        ValueFromPipeLine=$true
    )]
    [Alias("String")]
    [String]$EncryptedString,

    [Parameter(
        Mandatory=$True,
        Position=1
    )]
    [Alias("Key")]
    [byte[]]$EncryptionKey
)
    Try{
        $SecureString = ConvertTo-SecureString $EncryptedString -Key $EncryptionKey
        $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecureString)
        [string]$String = [Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)

        $data = @()
        [convert]::FromBase64String($encodedCommand) | ForEach-Object{
            If($_ -ne 0){
                $data += [char]$_
            }
        }

        Return ($data -join '')
    }
    Catch{Throw $_}

}
```
