# 1.2. Fixing invalid files

Previously, the `--validate` command noted that 6 individuals had bad EDFs and/or annotation files.  Here we'll try to investigate and fix these issues.

## Truncated EDFs

Two EDFs were reported as being corrupt (`F06.edf` and `F08.edf`).  If
we tried to open any of these files directly with Luna, we'd see an
error message.  One way to do this is to tell Luna to run the `DESC`
command on an EDF (this just prints some basic information from the
EDF header).

For a valid EDF, we might do and see the following (full
output is not shown, only select lines here):

```{ .sh .codeL }
luna work/data/edfs/F01.edf -s DESC
```
```
__________________________________________________________________
Processing: work/data/edfs/F01 [ #1 ]
 duration 03.00.30, 10830s | time 22.00.00 - 04.58.00 | date 01.01.85

 signals: 60 (of 60) selected in an EDF+D file
  Fp1 | Fp2 | AF3 | AF4 | F7 | F5 | F3 | F1
  F2 | F4 | F6 | F8 | FT7 | FC5 | FC3 | FC1
  FC2 | FC4 | FC6 | FT8 | T7 | C5 | C3 | C1
  C2 | C4 | C6 | T8 | TP7 | CP5 | CP3 | CP1
  CP2 | CP4 | CP6 | TP8 | P7 | P5 | P3 | P1
  P2 | P4 | P6 | P8 | PO3 | PO4 | O1 | O2
  AFZ | FZ | FCZ | CZ | CPZ | PZ | POz | OZ
  A1 | A2 | FPZ | EDF Annotations
  extracting 'EDF Annotations' track from EDF+


  EDF filename      : work/data/edfs/F01.edf
  ID                : work/data/edfs/F01
  Header start time : 22.00.00
  Last observed time: 04.58.00
  Duration          : 03:00:30  10830 sec
  Duration (w/ gaps): 06.58.00  25080 sec
  # signals         : 59
  # EDF annotations : 1
  Signals           : Fp1[128] Fp2[128] AF3[128] AF4[128] F7[128] F5[128]
                      F3[128] F1[128] F2[128] F4[128] F6[128] F8[128]
                      FT7[128] FC5[128] FC3[128] FC1[128] FC2[128] FC4[128]
                      FC6[128] FT8[128] T7[128] C5[128] C3[128] C1[128]
                      C2[128] C4[128] C6[128] T8[128] TP7[128] CP5[128]
                      CP3[128] CP1[128] CP2[128] CP4[128] CP6[128] TP8[128]
                      P7[128] P5[128] P3[128] P1[128] P2[128] P4[128]
                      P6[128] P8[128] PO3[128] PO4[128] O1[128] O2[128]
                      AFZ[128] FZ[128] FCZ[128] CZ[128] CPZ[128] PZ[128]
                      POz[128] OZ[128] A1[128] A2[128] FPZ[128]
```

Note that here we pass a single EDF file, whereas most Luna commands
tend to operate with a sample list (i.e. that specifies multiple EDFs
along with any associated annotations files).  How the data are
processed internally is identical.

As we'll investigate later, note that the `DESC` command indicates the
presence of _gaps_, as `F01.edf` happens to be an EDF+D file:

```
  Duration          : 03:00:30  10830 sec
  Duration (w/ gaps): 06.58.00  25080 sec
```

!!!info "Standard output and standard error streams" 
    A minor point, but note that whereas the console log is written to
    _standard error_ stream, the `DESC` output is written to _standard
    output_ and can thus be saved / extracted as follows:

    ```{ .sh .codeL }
    luna work/data/edfs/F01.edf -s DESC > desc-output.txt
    ```

    (Depending on the shell, standard error output is redirected with the
    `2>` operator rather than `>`.)
    
So, now we can see what happens for the two EDFs flagged as being
corrupt - i.e. we'd expect an error message of some sort, which was
the reason why `--validate` flagged these as bad files).

### F08

Starting with `F08.edf`, Luna gives the warning about a very small EDF: 

```{ .sh .codeL }
luna  work/data/edfs/F08.edf -s DESC
```
```
error : corrupt EDF, file < header size (256 bytes): work/data/edfs/F08.edf
```

This suggests the file has been truncated - _it is simply too small to be a
valid EDF_ (i.e. just the header only should be 256 bytes).  Indeed, if
we look at the file size, it is only 200 bytes (some output redacted
for clarity):

```{ .sh .codeL }
ls -l work/data/edfs/F08.edf
```
```
 200  work/data/edfs/F08.edf
```

This indeed matches what was listed in the [manipulations table](../data.md#signal-manipulations) for `F08`. 

!!!hint "Advanced viewing of binary EDfs"

    EDF files are binary, but a number of common command line tools can be used to inspect them directly, for example `xxd`:
    ```{ .sh .codeL }
    xxd < work/data/edfs/F08.edf
    ```
    ```
    00000000: 3020 2020 2020 2020 4630 3820 2020 2020  0       F08     
    00000010: 2020 2020 2020 2020 2020 2020 2020 2020                  
    00000020: 2020 2020 2020 2020 2020 2020 2020 2020                  
    00000030: 2020 2020 2020 2020 2020 2020 2020 2020                    
    00000040: 2020 2020 2020 2020 2020 2020 2020 2020                  
    00000050: 2020 2020 2020 2020 2e20 2020 2020 2020          .       
    00000060: 2020 2020 2020 2020 2020 2020 2020 2020                  
    00000070: 2020 2020 2020 2020 2020 2020 2020 2020                  
    00000080: 2020 2020 2020 2020 2020 2020 2020 2020                  
    00000090: 2020 2020 2020 2020 2020 2020 2020 2020                  
    000000a0: 2020 2020 2020 2020 3031 2e30 312e 3835          01.01.85
    000000b0: 3232 3a30 303a 3030 3135 3336 3020 2020  22.00.0015360   
    000000c0: 2020 2020 2020 2020                              
    ```

    Given some knowledge of the [EDF specification](https://www.edfplus.info/specs/index.html), we can see this
    is a partial EDF header - e.g. the `01.01.85` and start-time
    (`22.00.00`) fields appear where we'd expect them, as well as the ID `F08`
    (the ASCII field to the right of the hexadecimal dump).


Assuming this was a valid sleep study to begin with, this is
clearly not salvageable in any way: __the only route here would be to
re-export a new copy of the EDF from the original recording
software/database or contact the original data generator, etc.__  

### F06

What about the second instance of a corrupt EDF, `F06.edf`?

```{ .sh .codeL }
luna work/data/edfs/F06.edf -s DESC
```
```
error : corrupt EDF: expecting 370214400 but observed 370210000 bytes: work/data/edfs/F06.edf
details:
  header size ( = 256 + # signals * 256 ) = 15360
  num signals = 59
  record size = 15104
  number of records = 24510
  implied EDF size from header = 15360 + 15104 * 24510 = 370214400

  assuming header correct, implies the file has -0.291314 records too many
  (where one record is 1 seconds)

IF you're confident about the remaining data you can add the option:

    luna s.lst fix-edf=T ... 

  to attempt to fix this.  This may be appropriate under some circumstances, e.g.
  if just the last one or two records were clipped.  However, if other EDF header
  information is incorrect (e.g. number of signals, sample rates), then you'll be
  dealing with GIGO... so be sure to carefully check all signals for expected properties;
  really you should try to determine why the EDF was invalid in the first instance, though
```

This is a more subtle error than for `F08`.  We read a valid header
here, but the body of the EDF didn't match the size expected based on
the header information.  In particular, the message suggests it was
just under 1 second too short: `implies the file has -0.291314 records
too many (where one record is 1 seconds)`

__The best solution here, as above, would be first to try to obtain a
new, re-exported version of the file (e.g. in case it was truncated
during file transfer, etc).__

!!!info "Special option for fixing EDFs"
    This is a bit of an advanced
    edge-case, but Luna does provide an option to "fix" EDFs in this
    scenario, under some assumptions.  This can be useful, as it is
    not uncommon for some EDF generators to write only a partial last
    record.  Note that all EDFs have a fixed record size (this is
    often 1 second, but could be different).  If the recording stopped
    at, say, 30000.2 seconds, then the exported EDF should really be
    either 30000 or 30001 seconds (assuming a 1 second record size) -
    i.e. we always require an integer number of whole records. But some software (incorrectly)
    output a partial record. 
    
    If this type of issue occurs, we can try Luna's `fix-edf` special option. In this case, it should be able to
    successfully load the file, by dropping the last, partial record:

    ```{ .sh .codeL }
    luna  work/data/edfs/F06.edf fix-edf=T -o out.db  -s EPOCH
    ```
    This invocation doesn't generate any error.   Paired with the `EPOCH` command to generate some output, we see it
    contains 816 full (30s) epochs.  Based on the header, the original
    file was expecting 24510 seconds, which is exactly 24510 / 30 =
    817 epochs.  Looking at the output, we see 29 seconds not spanned
    by an epoch (`TOT_UNSPANNED`) - i.e. this reflects the final 29s stretch, as the
    last record (1s) was removed, as expected:

    ```{ .sh .codeL }
    destrat out.db +EPOCH  | behead
    ```
    ```
                       ID   work/data/edfs/F06  
                      DUR   30                  
                FIXED_DUR   30                  
                  GENERIC   0                   
                      INC   30                  
                       NE   816                 
                   OFFSET   0                   
                  TOT_DUR   24480               
                  TOT_PCT   0.998 
                  TOT_REC   24509               
              TOT_SPANNED   24480               
            TOT_UNSPANNED   29                  
    ```
    If taking this route, one would pair `fix-edf` with a `WRITE` command to generate a new, valid EDF, and
    subsequently work from that version, e.g. something like:
    ```{ .sh .codeL }
    luna  work/data/edfs/F06.edf fix-edf=T -s WRITE edf-dir=tmp/
    ```

### Fixing EDFs

In this walkthrough, we'll take the approach of "re-exporting" the
EDF, i.e. going to the original `v1` dataset: there are some
circumstances where it is always best to go back to the source, if
possible. This involves copying the original files from `luna-grins/v1/edfs/`:

```{ .sh .codeL }
cp luna-grins/v1/edfs/F06.edf luna-grins/v1/edfs/F08.edf work/data/edfs/
```


## Invalid annotation file formats

Next, we'll look at the annotation files that were flagged as invalid
by `--validate`: two CSV files (`M01.csv` and `M02.csv`) and two TSV
files (`M03.tsv` and `M04.tsv`).

### CSV files

There is an easy explantation here: Luna does not accept
comma-delimited lists as annotation files. Valid formats are described
[here](https://zzz.bwh.harvard.edu/luna/ref/annotations/#luna-annotations).  As expected given the file extension,
these are indeed a comma-delimited files, e.g.:
```{ .sh .codeL }
head work/data/annots/M01.csv
```
```
class,start,stop
W,22:00:00,22:00:30
W,22:00:30,22:01:00
W,22:01:00,22:01:30
W,22:01:30,22:02:00
W,22:02:00,22:02:30
W,22:02:30,22:03:00
N1,22:03:00,22:03:30
N1,22:03:30,22:04:00
N1,22:04:00,22:04:30
```

The solution is simply to generate tab-delimited versions of these files, that can
be achieved by Excel, R, Python or even a simple text editor, to
search-and-replace commas.  Here, we'll use the command line
`sed` tool to swap these out, replacing `,` with tab (`\t`) and saving as new `.tsv` files:

```{ .sh .codeL }
sed 's/,/\t/g' < work/data/annots/M01.csv > work/data/annots/M01.tsv
```
and
```{ .sh .codeL }
sed 's/,/\t/g' < work/data/annots/M02.csv > work/data/annots/M02.tsv
```

We can confirm the `.tsv` files have the correct format:
```{ .sh .codeL }
head work/data/annots/M01.tsv 
```
```
class	start	        stop
W	22:00:00	22:00:30
W	22:00:30	22:01:00
W	22:01:00	22:01:30
W	22:01:30	22:02:00
W	22:02:00	22:02:30
W	22:02:30	22:03:00
N1	22:03:00	22:03:30
N1	22:03:30	22:04:00
N1	22:04:00	22:04:30
```

### TSV files

The other two files TSV (`M03.tsv` and `M04.tsv`) have a valid delimiter, but still gave an error messages, albeit
a more cryptic one:
```
problem : [M03] bad format for class/inst pairing: 22:00:00
problem : [M04] bad format for class/inst pairing: 22:00:00
```

Looking at the file, we see it is not consistent with Luna
formats (described
[here](https://zzz.bwh.harvard.edu/luna/ref/annotations/#luna-annotations)).

```{ .sh .codeL }
head work/data/annots/M03.tsv
```
```
22:00:00	W	+30
22:00:30	W	+30
22:01:00	W	+30
22:01:30	W	+30
22:02:00	W	+30
22:02:30	W	+30
22:03:00	W	+30
22:03:30	W	+30
22:04:00	W	+30
22:04:30	W	+30
```

Specifically, although a simple 3-column format is allowed, Luna expects a
class label, then a start time, then a stop time (or other offset
marker, as here with the duration specification of 30 seconds `+30`).

This incorrect ordering of columns has led to the error message in
this case (as by default, the colon `:` character is reserved for
pairing of class and instance IDs typically). However, this can be
easily avoided - as above, we could use Excel, R, etc, but here we use
the `awk` command line tool to rearrange the order of columns:


```{ .sh .codeL }
awk ' { print $2 , $1 , $3 } ' OFS="\t" work/data/annots/M03.tsv > xx
mv xx work/data/annots/M03.tsv
```
and
```{ .sh .codeL }
awk ' { print $2 , $1 , $3 } ' OFS="\t" work/data/annots/M04.tsv > xx
mv xx work/data/annots/M04.tsv
```

We can now confirm the correct format:
```{ .sh .codeL }
head work/data/annots/M03.tsv
```
```
W	22:00:00	+30
W	22:00:30	+30
W	22:01:00	+30
W	22:01:30	+30
W	22:02:00	+30
W	22:02:30	+30
W	22:03:00	+30
W	22:03:30	+30
W	22:04:00	+30
W	22:04:30	+30
```

(Obviously, if a large number of files were impacted, one could use a
simple shell loop to process them automatically.)

## Validating the final set

We'll rebuild the sample list but this time omit the CSV from the list of searched-for extensions, as we've 
reminded ourselves that Luna doesn't accept CSVs. Instead, this will attach the newly created `.tsv` files:
```{ .sh .codeL }
luna --build work/data/edfs/ work/data/annots -ext=annot,eannot,xml,tsv > s1.lst
```
Assuming you've swapped out the corrupt EDFs as suggested above, re-running `--validate` now indicates
that all files can be successfully opened and parsed:

```{ .sh .codeL }
luna --validate -o out.db --options slist=s1.lst
```
```
  all good, no problems detected in 20 observations scanned
```

The [next step](hdr.md) is to begin looking at the contents of these files, starting with a review of EDF headers.