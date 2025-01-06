# 1.3. Examining EDF headers

So far, we've managed to overcome some initial problems and 
now have a validated dataset in which every signal and annotation file can at
least be opened.  Now let's start to look at the contents of these
files, beginning with the EDFs.  Are they what we expect?  Do all 20
EDFs look similar or not?

## Examining headers

We can use the `HEADERS` command to display basic information about the EDFs in this project:

```{ .sh .codeL }
luna s1.lst -o out.db -s HEADERS
```

Looking at a subset of the output, where each row contains (a subset of the output) for each individual:
```{ .sh .codeL }
destrat out.db +HEADERS -v EDF_TYPE NS NR REC_DUR TOT_DUR_HMS 
```
```
ID     EDF_TYPE NR       NS   REC_DUR   TOT_DUR_HMS
F01    EDF+D    10830    59   1         06:58:00
F02    EDF      25833    59   1         07:10:33
F03    EDF      26124    59   1         07:15:24
F04    EDF      26322    59   1         07:18:42
F05    EDF      26906    59   1         07:28:26
F06    EDF      24510    59   1         06:48:30
F07    EDF      28326    59   1         07:52:06
F08    EDF      25285    59   1         07:01:25
F09    EDF      23393    59   1         06:29:53
F10    EDF+D    27646    59   1         07:46:23
M01    EDF      26285    59   1         07:18:05
M02    EDF      26563    59   1         07:22:43
M03    EDF      28140    59   1         07:49:00
M04    EDF      28532    58   1         07:55:32
M05    EDF      28005    59   1         07:46:45
M06    EDF      1612     59   17        07:36:44
M07    EDF      29960    59   1         08:19:20
M08    EDF      29460    59   1         08:11:00
M09    EDF      29312    57   1         08:08:32
M10    EDF+D    26736    59   1         07:33:02
```

Here the key variables we focus on:

 - `EDF_TYPE`: is the file a standard EDF or an EDF+ (either continuous or discontinuous)?
 - `NR` : number of records in the EDF
 - `NS` : number of signals in the EDF
 - `REC_DUR`: duration (in seconds) of each EDF record
 - `TOT_DUR_HMS` : total duration of the recordings in _hh:mm:ss_ format

We can note a few things:

 - three files are EDF+, with the `D` indicating that _discontinuities_ or gaps are present

 - all but two EDFs have 59 signals (`NS`) as expected, expect one (`M04`) that has one channel fewer, and one (`M09`) that has two fewer

 - one file has a different (and unsual) EDF record size: 17 versus 1 second

 - otherwise, all files appear to have broadly typically durations for sleep studies (i.e. 7-8 hours).

---

The `HEADERS` command gives a lot more information that we'll look at in subsequent sections, giving more information about the channels present.
But first, let's [take a look](recsize.md) at the one EDF (`M06`) that has a different EDF record size. 