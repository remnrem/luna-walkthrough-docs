# 1.5. Reviewing and harmonizing channel labels

Returning to the `HEADERS` command, we'll now look at the
_channel-level_ information. Let's re-run `HEADERS`:

```{ .sh .codeL }
luna s1.lst -o out.db -s HEADERS
```

We can request the channel-level outputs - here just a subset of variables (columns), sample rate (`SR`) and physical dimension/units (`PDIM`):

```{ .sh .codeL }
destrat out.db +HEADERS -r CH -v SR PDIM
```
```
ID    CH    PDIM  SR
F01   Fp1   uV    128
F01   Fp2   uV    128
F01   AF3   uV    128
F01   AF4   uV    128
F01   F7    uV    128
F01   F5    uV    128
F01   F3    uV    128
F01   F1    uV    128
F01   F2    uV    128
...
```

Below we'll examine the output of `HEADERS` to tell us something about
the channel labels and any implied referencing, the sample rates, and
physical units of the studies.  We'll then create a new set of EDFs
that have been _harmonized_ with respect to these features.


## Labels

The prior `destrat` run gives a lot of output - one row per individual per channel.  For now, if you just scroll through you'll see some output such as:

```
...
M09    Fp1__M1_M2__2    uV    128
M09    Fp2__M1_M2__2    uV    128
M09    AF3__M1_M2__2    uV    128
M09    AF4__M1_M2__2    uV    128
...
```

The strange-looking labels (e.g. `Fp1__M1_M2__2`) arise because, by
default, Luna _sanitizes_ channel and annotation labels to make them
easier to work with.  In particular, it removes _special characters_
and whitespace in labels.  In this particular case, for example:

```
    Fp1-(M1+M2)/2
```
becomes
```
    Fp1__M1_M2__2
```

That is, the characters `-`, `(`, `)`, `+` and `/` are replaced with
an underscore `_`.  (If Luna needs to make the labels unique, it
appends `.1`, `.2`, etc.) As Luna is a command line tool, for which
channels or annotation labels may be passed as textual arguments, this
often makes life easier.  Further, Luna _output_ is designed to be
amendable to further automated processing, e.g. by tools such as R.

To turn off this feature, we can set
both the `sanitize` and `keep-spaces` special options, to _false_ and
_true_ respectively:

```{ .sh .codeL }
luna s1.lst sanitize=F keep-spaces=T -o out.db -s HEADERS
```
```{ .sh .codeL }
destrat out.db +HEADERS -r CH -v SR PDIM
```
We now see the corresponding rows are as follows:
```
...
M09    Fp1-(M1+M2)/2    uV    128
M09    Fp2-(M1+M2)/2    uV    128
M09    AF3-(M1+M2)/2    uV    128
M09    AF4-(M1+M2)/2    uV    128
...
```

!!! info "Rationale for label sanitization"
    We might often wish to extract metrics that are stratified by channel, and may wish to make column headers (i.e. _variable names_ when read into programs such as R), as follows:
    ```
    destrat out.db +HEADERS -c CH -v SR
    ```
    This (with the `-c` column option instead of the `-r` row option) will create columns with header labels such as (for sample rate `SR`):
    ```
    SR.CH_AF3-(M1+M2)/2
    ```
    This is a challenging name in R, which references variable _V_ in dataframe _d_ typically as `d$V`, 
    as it would need to be quoted
    (e.g. `d$"SR.CH_AF3-(M1+M2)/2"` or `d[ , "SR.CH_AF3-(M1+M2)/2" ]`) and these expressions can be confusing to read in the context of other expressions.
    We can at least refer to 
    `d$AF3__M1_M2__2` directly; but ideally, given we know the context of a harmonized study (e.g. the referencing scheme used, etc),
    it is far easier to map to labels such as `AF3` etc, in which case the implied variable would be `d$SR.CH_AF3`.

---
	

Moving on, we can enumerate the number of channel labels observed in
the project as a whole, e.g. by extracting the second column of `CH`
labels from `destrat` (by `cut -f2`), and then `sort`-ing and counting
(`uniq -c`) the number of each label (i.e. number of
EDFs/individuals): _partial output shown here, showing only rows
related to C3_:


```{ .sh .codeL }
destrat out.db +HEADERS -r CH -v SR PDIM | cut -f2 | sort | uniq -c
```
```
16  C3
  ...
1   C3 REF
  ...
1   C3-(M1+M2)/2
  ...
1   EEG-C3
  ...
1   c3
```

The above just extracts the rows relevant for channel C3 from the
output - here we see the 20 individuals come in five distinct forms
(with the 20 records = 16+1+1+1+1 label instances). 

To get a fuller idea of the full configurations of channel labels, it
can be useful to run `HEADERS` with the `signals` option (it adds a
`SIGNALS` variable to the output, which is a comma-delimited string of
all channels), and also setting the special variable `order-signals`
to _true_, to ensure this list is alpha-numerically sorted (we'll also
add `sanitize=F keep-spaces=T` to output the _original_ labels in this
case):

```{ .sh .codeL }
luna s1.lst sanitize=F keep-spaces=T order-signals=T -o out.db -s HEADERS signals
```
```{ .sh .codeL }
destrat out.db +HEADERS -v SIGNALS
```

```
ID    SIGNALS
F01    Fp1,Fp2,AF3,AF4,F7,F5,F3,F1,F2,F4,F6,F8,FT7,FC5,FC3,FC1,FC2,FC4,FC6,FT8,T7,C5,C3,C1,C2,C4,C6,T8,TP7,CP5,CP3,CP1,CP2,CP4,CP6,TP8,P7,P5,P3,P1,P2,P4,P6,P8,PO3,PO4,O1,O2,AFZ,FZ,FCZ,CZ,CPZ,PZ,POz,OZ,A1,A2,FPZ
F02    Fp1,Fp2,AF3,AF4,F7,F5,F3,F1,F2,F4,F6,F8,FT7,FC5,FC3,FC1,FC2,FC4,FC6,FT8,T7,C5,C3,C1,C2,C4,C6,T8,TP7,CP5,CP3,CP1,CP2,CP4,CP6,TP8,P7,P5,P3,P1,P2,P4,P6,P8,PO3,PO4,O1,O2,AFZ,FZ,FCZ,CZ,CPZ,PZ,POz,OZ,A1,A2,FPZ
F03    Fp1,Fp2,AF3,AF4,F7,F5,F3,F1,F2,F4,F6,F8,FT7,FC5,FC3,FC1,FC2,FC4,FC6,FT8,T7,C5,C3,C1,C2,C4,C6,T8,TP7,CP5,CP3,CP1,CP2,CP4,CP6,TP8,P7,P5,P3,P1,P2,P4,P6,P8,PO3,PO4,O1,O2,AFZ,FZ,FCZ,CZ,CPZ,PZ,POz,OZ,A1,A2,FPZ
F04    Fp1,Fp2,AF3,AF4,F7,F5,F3,F1,F2,F4,F6,F8,FT7,FC5,FC3,FC1,FC2,FC4,FC6,FT8,T7,C5,C3,C1,C2,C4,C6,T8,TP7,CP5,CP3,CP1,CP2,CP4,CP6,TP8,P7,P5,P3,P1,P2,P4,P6,P8,PO3,PO4,O1,O2,AFZ,FZ,FCZ,CZ,CPZ,PZ,POz,OZ,A1,A2,FPZ
F05    Fp1,Fp2,AF3,AF4,F7,F5,F3,F1,F2,F4,F6,F8,FT7,FC5,FC3,FC1,FC2,FC4,FC6,FT8,T7,C5,C3,C1,C2,C4,C6,T8,TP7,CP5,CP3,CP1,CP2,CP4,CP6,TP8,P7,P5,P3,P1,P2,P4,P6,P8,PO3,PO4,O1,O2,AFZ,FZ,FCZ,CZ,CPZ,PZ,POz,OZ,A1,A2,FPZ
F06    Fp1,Fp2,AF3,AF4,F7,F5,F3,F1,F2,F4,F6,F8,FT7,FC5,FC3,FC1,FC2,FC4,FC6,FT8,T7,C5,C3,C1,C2,C4,C6,T8,TP7,CP5,CP3,CP1,CP2,CP4,CP6,TP8,P7,P5,P3,P1,P2,P4,P6,P8,PO3,PO4,O1,O2,AFZ,FZ,FCZ,CZ,CPZ,PZ,POz,OZ,A1,A2,FPZ
F07    Fp1,Fp2,AF3,AF4,F7,F5,F3,F1,F2,F4,F6,F8,FT7,FC5,FC3,FC1,FC2,FC4,FC6,FT8,T7,C5,C3,C1,C2,C4,C6,T8,TP7,CP5,CP3,CP1,CP2,CP4,CP6,TP8,P7,P5,P3,P1,P2,P4,P6,P8,PO3,PO4,O1,O2,AFZ,FZ,FCZ,CZ,CPZ,PZ,POz,OZ,A1,A2,FPZ
F08    Fp1,Fp2,AF3,AF4,F7,F5,F3,F1,F2,F4,F6,F8,FT7,FC5,FC3,FC1,FC2,FC4,FC6,FT8,T7,C5,C3,C1,C2,C4,C6,T8,TP7,CP5,CP3,CP1,CP2,CP4,CP6,TP8,P7,P5,P3,P1,P2,P4,P6,P8,PO3,PO4,O1,O2,AFZ,FZ,FCZ,CZ,CPZ,PZ,POz,OZ,A1,A2,FPZ
F09    Fp1,Fp2,AF3,AF4,F7,F5,F3,F1,F2,F4,F6,F8,FT7,FC5,FC3,FC1,FC2,FC4,FC6,FT8,T7,C5,C3,C1,C2,C4,C6,T8,TP7,CP5,CP3,CP1,CP2,CP4,CP6,TP8,P7,P5,P3,P1,P2,P4,P6,P8,PO3,PO4,O1,O2,AFZ,FZ,FCZ,CZ,CPZ,PZ,POz,OZ,A1,A2,FPZ
F10    Fp1,Fp2,AF3,AF4,F7,F5,F3,F1,F2,F4,F6,F8,FT7,FC5,FC3,FC1,FC2,FC4,FC6,FT8,T7,C5,C3,C1,C2,C4,C6,T8,TP7,CP5,CP3,CP1,CP2,CP4,CP6,TP8,P7,P5,P3,P1,P2,P4,P6,P8,PO3,PO4,O1,O2,AFZ,FZ,FCZ,CZ,CPZ,PZ,POz,OZ,A1,A2,FPZ
M01    Fp1,Fp2,AF3,AF4,F7,F5,F3,F1,F2,F4,F6,F8,FT7,FC5,FC3,FC1,FC2,FC4,FC6,FT8,T7,C5,C3,C1,C2,C4,C6,T8,TP7,CP5,CP3,CP1,CP2,CP4,CP6,TP8,P7,P5,P3,P1,P2,P4,P6,P8,PO3,PO4,O1,O2,AFZ,FZ,FCZ,CZ,CPZ,PZ,POz,OZ,A1,A2,FPZ
M02    Fp1,Fp2,AF3,AF4,F7,F5,F3,F1,F2,F4,F6,F8,FT7,FC5,FC3,FC1,FC2,FC4,FC6,FT8,T7,C5,C3,C1,C2,C4,C6,T8,TP7,CP5,CP3,CP1,CP2,CP4,CP6,TP8,P7,P5,P3,P1,P2,P4,P6,P8,PO3,PO4,O1,O2,AFZ,FZ,FCZ,CZ,CPZ,PZ,POz,OZ,A1,A2,FPZ
M03    Fp1,Fp2,AF3,AF4,F7,F5,F1,F2,F6,F8,FT7,FC5,FC3,FC1,FC2,FC4,FC6,FT8,T7,C5,C1,C2,C6,T8,TP7,CP5,CP3,CP1,CP2,CP4,CP6,TP8,P7,P5,P1,P2,P6,P8,PO3,PO4,O1,O2,AFZ,FZ,FCZ,CZ,CPZ,PZ,POz,OZ,A1,A2,FPZ,C3,C4,F3,F4,P3,P4
M04    Fp1,Fp2,AF3,AF4,F7,F5,F3,F1,F2,F4,F6,F8,FT7,FC5,FC3,FC1,FC2,FC4,FC6,FT8,T7,C5,C3,C1,C2,C4,C6,T8,TP7,CP5,CP3,CP1,CP2,CP4,CP6,TP8,P7,P5,P3,P1,P2,P4,P6,P8,PO3,PO4,O1,O2,AFZ,FZ,FCZ,CPZ,PZ,POz,OZ,A1,A2,FPZ
M05    fp1,fp2,af3,af4,f7,f5,f3,f1,f2,f4,f6,f8,ft7,fc5,fc3,fc1,fc2,fc4,fc6,ft8,t7,c5,c3,c1,c2,c4,c6,t8,tp7,cp5,cp3,cp1,cp2,cp4,cp6,tp8,p7,p5,p3,p1,p2,p4,p6,p8,po3,po4,o1,o2,afz,fz,fcz,cz,cpz,pz,poz,oz,a1,a2,fpz
M06    FP1,FP2,AF3,AF4,F7,F5,F3,F1,F2,F4,F6,F8,FT7,FC5,FC3,FC1,FC2,FC4,FC6,FT8,T7,C5,C3,C1,C2,C4,C6,T8,TP7,CP5,CP3,CP1,CP2,CP4,CP6,TP8,P7,P5,P3,P1,P2,P4,P6,P8,PO3,PO4,O1,O2,AFZ,FZ,FCZ,CZ,CPZ,PZ,POZ,OZ,A1,A2,FPZ
M07    EEG-Fp1,EEG-Fp2,EEG-AF3,EEG-AF4,EEG-F7,EEG-F5,EEG-F3,EEG-F1,EEG-F2,EEG-F4,EEG-F6,EEG-F8,EEG-FT7,EEG-FC5,EEG-FC3,EEG-FC1,EEG-FC2,EEG-FC4,EEG-FC6,EEG-FT8,EEG-T7,EEG-C5,EEG-C3,EEG-C1,EEG-C2,EEG-C4,EEG-C6,EEG-T8,EEG-TP7,EEG-CP5,EEG-CP3,EEG-CP1,EEG-CP2,EEG-CP4,EEG-CP6,EEG-TP8,EEG-P7,EEG-P5,EEG-P3,EEG-P1,EEG-P2,EEG-P4,EEG-P6,EEG-P8,EEG-PO3,EEG-PO4,EEG-O1,EEG-O2,EEG-AFZ,EEG-FZ,EEG-FCZ,EEG-CZ,EEG-CPZ,EEG-PZ,EEG-POz,EEG-OZ,EEG-A1,EEG-A2,EEG-FPZ
M08    Fp1 REF,Fp2 REF,AF3 REF,AF4 REF,F7 REF,F5 REF,F3 REF,F1 REF,F2 REF,F4 REF,F6 REF,F8 REF,FT7 REF,FC5 REF,FC3 REF,FC1 REF,FC2 REF,FC4 REF,FC6 REF,FT8 REF,T7 REF,C5 REF,C3 REF,C1 REF,C2 REF,C4 REF,C6 REF,T8 REF,TP7 REF,CP5 REF,CP3 REF,CP1 REF,CP2 REF,CP4 REF,CP6 REF,TP8 REF,P7 REF,P5 REF,P3 REF,P1 REF,P2 REF,P4 REF,P6 REF,P8 REF,PO3 REF,PO4 REF,O1 REF,O2 REF,AFZ REF,FZ REF,FCZ REF,CZ REF,CPZ REF,PZ REF,POz REF,OZ REF,A1 REF,A2 REF,FPZ REF
M09    Fp1-(M1+M2)/2,Fp2-(M1+M2)/2,AF3-(M1+M2)/2,AF4-(M1+M2)/2,F7-(M1+M2)/2,F5-(M1+M2)/2,F3-(M1+M2)/2,F1-(M1+M2)/2,F2-(M1+M2)/2,F4-(M1+M2)/2,F6-(M1+M2)/2,F8-(M1+M2)/2,FT7-(M1+M2)/2,FC5-(M1+M2)/2,FC3-(M1+M2)/2,FC1-(M1+M2)/2,FC2-(M1+M2)/2,FC4-(M1+M2)/2,FC6-(M1+M2)/2,FT8-(M1+M2)/2,T7-(M1+M2)/2,C5-(M1+M2)/2,C3-(M1+M2)/2,C1-(M1+M2)/2,C2-(M1+M2)/2,C4-(M1+M2)/2,C6-(M1+M2)/2,T8-(M1+M2)/2,TP7-(M1+M2)/2,CP5-(M1+M2)/2,CP3-(M1+M2)/2,CP1-(M1+M2)/2,CP2-(M1+M2)/2,CP4-(M1+M2)/2,CP6-(M1+M2)/2,TP8-(M1+M2)/2,P7-(M1+M2)/2,P5-(M1+M2)/2,P3-(M1+M2)/2,P1-(M1+M2)/2,P2-(M1+M2)/2,P4-(M1+M2)/2,P6-(M1+M2)/2,P8-(M1+M2)/2,PO3-(M1+M2)/2,PO4-(M1+M2)/2,O1-(M1+M2)/2,O2-(M1+M2)/2,AFZ-(M1+M2)/2,FZ-(M1+M2)/2,FCZ-(M1+M2)/2,CZ-(M1+M2)/2,CPZ-(M1+M2)/2,PZ-(M1+M2)/2,POz-(M1+M2)/2,OZ-(M1+M2)/2,FPZ-(M1+M2)/2
M10    Fp1,Fp2,AF3,AF4,F7,F5,F3,F1,F2,F4,F6,F8,FT7,FC5,FC3,FC1,FC2,FC4,FC6,FT8,T7,C5,C3,C1,C2,C4,C6,T8,TP7,CP5,CP3,CP1,CP2,CP4,CP6,TP8,P7,P5,P3,P1,P2,P4,P6,P8,PO3,PO4,O1,O2,AFZ,FZ,FCZ,CZ,CPZ,PZ,POz,OZ,A1,A2,FPZ
```

We can use some basic command line tools to produce a count of the number of unique patterns, and sort this by the most common first (number in first row):
```{ .sh .codeL }
destrat out.db +HEADERS -v SIGNALS | awk ' NR != 1 ' | cut -f2- | sort | uniq -c | sort -nr
```
```
14 A1,A2,AF3,AF4,AFZ,C1,C2,C3,C4,C5,C6,CP1,CP2,CP3,CP4,CP5,CP6,CPZ,CZ,F1,F2,F3,F4,F5,F6,F7,F8,FC1,FC2,FC3,FC4,FC5,FC6,FCZ,FPZ,FT7,FT8,FZ,Fp1,Fp2,O1,O2,OZ,P1,P2,P3,P4,P5,P6,P7,P8,PO3,PO4,POz,PZ,T7,T8,TP7,TP8
1  a1,a2,af3,af4,afz,c1,c2,c3,c4,c5,c6,cp1,cp2,cp3,cp4,cp5,cp6,cpz,cz,f1,f2,f3,f4,f5,f6,f7,f8,fc1,fc2,fc3,fc4,fc5,fc6,fcz,fp1,fp2,fpz,ft7,ft8,fz,o1,o2,oz,p1,p2,p3,p4,p5,p6,p7,p8,po3,po4,poz,pz,t7,t8,tp7,tp8
1  EEG-A1,EEG-A2,EEG-AF3,EEG-AF4,EEG-AFZ,EEG-C1,EEG-C2,EEG-C3,EEG-C4,EEG-C5,EEG-C6,EEG-CP1,EEG-CP2,EEG-CP3,EEG-CP4,EEG-CP5,EEG-CP6,EEG-CPZ,EEG-CZ,EEG-F1,EEG-F2,EEG-F3,EEG-F4,EEG-F5,EEG-F6,EEG-F7,EEG-F8,EEG-FC1,EEG-FC2,EEG-FC3,EEG-FC4,EEG-FC5,EEG-FC6,EEG-FCZ,EEG-FPZ,EEG-FT7,EEG-FT8,EEG-FZ,EEG-Fp1,EEG-Fp2,EEG-O1,EEG-O2,EEG-OZ,EEG-P1,EEG-P2,EEG-P3,EEG-P4,EEG-P5,EEG-P6,EEG-P7,EEG-P8,EEG-PO3,EEG-PO4,EEG-POz,EEG-PZ,EEG-T7,EEG-T8,EEG-TP7,EEG-TP8
1  AF3-(M1+M2)/2,AF4-(M1+M2)/2,AFZ-(M1+M2)/2,C1-(M1+M2)/2,C2-(M1+M2)/2,C3-(M1+M2)/2,C4-(M1+M2)/2,C5-(M1+M2)/2,C6-(M1+M2)/2,CP1-(M1+M2)/2,CP2-(M1+M2)/2,CP3-(M1+M2)/2,CP4-(M1+M2)/2,CP5-(M1+M2)/2,CP6-(M1+M2)/2,CPZ-(M1+M2)/2,CZ-(M1+M2)/2,F1-(M1+M2)/2,F2-(M1+M2)/2,F3-(M1+M2)/2,F4-(M1+M2)/2,F5-(M1+M2)/2,F6-(M1+M2)/2,F7-(M1+M2)/2,F8-(M1+M2)/2,FC1-(M1+M2)/2,FC2-(M1+M2)/2,FC3-(M1+M2)/2,FC4-(M1+M2)/2,FC5-(M1+M2)/2,FC6-(M1+M2)/2,FCZ-(M1+M2)/2,FPZ-(M1+M2)/2,FT7-(M1+M2)/2,FT8-(M1+M2)/2,FZ-(M1+M2)/2,Fp1-(M1+M2)/2,Fp2-(M1+M2)/2,O1-(M1+M2)/2,O2-(M1+M2)/2,OZ-(M1+M2)/2,P1-(M1+M2)/2,P2-(M1+M2)/2,P3-(M1+M2)/2,P4-(M1+M2)/2,P5-(M1+M2)/2,P6-(M1+M2)/2,P7-(M1+M2)/2,P8-(M1+M2)/2,PO3-(M1+M2)/2,PO4-(M1+M2)/2,POz-(M1+M2)/2,PZ-(M1+M2)/2,T7-(M1+M2)/2,T8-(M1+M2)/2,TP7-(M1+M2)/2,TP8-(M1+M2)/2
1  A1,A2,AF3,AF4,AFZ,C1,C2,C3,C4,C5,C6,CP1,CP2,CP3,CP4,CP5,CP6,CPZ,F1,F2,F3,F4,F5,F6,F7,F8,FC1,FC2,FC3,FC4,FC5,FC6,FCZ,FPZ,FT7,FT8,FZ,Fp1,Fp2,O1,O2,OZ,P1,P2,P3,P4,P5,P6,P7,P8,PO3,PO4,POz,PZ,T7,T8,TP7,TP8
1  A1,A2,AF3,AF4,AFZ,C1,C2,C3,C4,C5,C6,CP1,CP2,CP3,CP4,CP5,CP6,CPZ,CZ,F1,F2,F3,F4,F5,F6,F7,F8,FC1,FC2,FC3,FC4,FC5,FC6,FCZ,FP1,FP2,FPZ,FT7,FT8,FZ,O1,O2,OZ,P1,P2,P3,P4,P5,P6,P7,P8,PO3,PO4,POZ,PZ,T7,T8,TP7,TP8
1  A1 REF,A2 REF,AF3 REF,AF4 REF,AFZ REF,C1 REF,C2 REF,C3 REF,C4 REF,C5 REF,C6 REF,CP1 REF,CP2 REF,CP3 REF,CP4 REF,CP5 REF,CP6 REF,CPZ REF,CZ REF,F1 REF,F2 REF,F3 REF,F4 REF,F5 REF,F6 REF,F7 REF,F8 REF,FC1 REF,FC2 REF,FC3 REF,FC4 REF,FC5 REF,FC6 REF,FCZ REF,FPZ REF,FT7 REF,FT8 REF,FZ REF,Fp1 REF,Fp2 REF,O1 REF,O2 REF,OZ REF,P1 REF,P2 REF,P3 REF,P4 REF,P5 REF,P6 REF,P7 REF,P8 REF,PO3 REF,PO4 REF,POz REF,PZ REF,T7 REF,T8 REF,TP7 REF,TP8 REF
```
So, 14 people have the _standard_ form, one has lower cases names, one has labels in the form `EEG-C3`, etc. 	 

---

Returning to the example of C3 above, conceptually, all the above
instances to C3 refer to the same entity (and so should be similarly
labelled to facilitate downstream analysis) with the exception that
`M09` contains C3 already re-referenced against the linked mastoids
(`C3-(M1+M2)/2`) whereas the others have C3 measured with respect to
potentials at the recording reference.

!!!hint "Inferring channel types from labels"
    Typically, this cannot
    be unambiguously deduced from the EDF labels or signals alone,
    especially as, in practice, different labs/software/techs tend to
    adopt inconsistent naming standards.  In this case, we see that
    all other 19 EDFs have both left and right mastoids measured
    (either `A1` and `A2` or `M1` and `M2`), whereas `M09` does not.
    As [detailed here](../data.md), we know in this instance that
    `M09` was in fact already re-referenced; in practice, one would
    want to double-check with the generator of the data, rather than
    assume a given referencing scheme, if it is not self-evident from
    the labels.

For our analyses here, we want all studies to adopt the
same linked-mastoid referencing scheme. So we want to do two things:

 - for all records except `M09`, re-reference each EEG channel against the average of the two mastoids

 - set all labels to be consistent across records: for simplicity, we will use just `C3`, and so on

To do this, we can use Luna's _alias_ functions to automatically change channel labels.  If we have
a file with a line containing an expression in the form:
```
alias    primary|alt1|alt2|alt3
```
then any instance of `alt1` (matched ignoring case and after any _sanitization_) will be changed to `primary`, and likewise for `alt2` and `alt3`.  Different
aliases can listed using a pipe (`|`) character.  We can have aliases specified in a text file, or add them on the command line, in
which case the syntax is slightly different:
```{ .sh .codeL }
luna ex.lst alias="primary|alt1|alt2|alt3" -o out.db -s <commands...>
```

Note here that we have to quote the entire expression, so the shell
does not try to interpret the `|` characters (more details on this
[here](../prep.md#shell-orientation)).

In our case, having previously reviewed the output from `HEADERS`, we'll want something like this for C3:
```
alias    C3|C3-(M1+M2)/2|EEG-C3|"C3 REF"
```    

Note, we need to use quotes (`"`) in the last instance, as it contains
a space.  Also note that by default the same _sanitization_ is applied
to aliases, and so we don't need to specify both `C3__M1_M2__2` as
well as `C3-(M1+M2)/2`, etc, as they are effectively equivalent
here.  Likewise, as matching is case insensitive, `c3` will match the primary and be written as `C3`.
This means that all these variants seen above will be relabelled as `C3`.

The folder `work/data/auxiliary/` should contain a premade plaintext file
called `cmaps` that has the corresponding alias definitions for all
channels:

```{ .sh .codeL }
cat work/data/auxiliary/cmaps 
```
```
alias    Fp1|Fp1-(M1+M2)/2|EEG-Fp1|"Fp1 REF"
alias    Fp2|Fp2-(M1+M2)/2|EEG-Fp2|"Fp2 REF"
alias    AF3|AF3-(M1+M2)/2|EEG-AF3|"AF3 REF"
alias    AF4|AF4-(M1+M2)/2|EEG-AF4|"AF4 REF"
alias    F7|F7-(M1+M2)/2|EEG-F7|"F7 REF"
alias    F5|F5-(M1+M2)/2|EEG-F5|"F5 REF"
alias    F3|F3-(M1+M2)/2|EEG-F3|"F3 REF"
alias    F1|F1-(M1+M2)/2|EEG-F1|"F1 REF"
alias    F2|F2-(M1+M2)/2|EEG-F2|"F2 REF"
alias    F4|F4-(M1+M2)/2|EEG-F4|"F4 REF"
alias    F6|F6-(M1+M2)/2|EEG-F6|"F6 REF"
alias    F8|F8-(M1+M2)/2|EEG-F8|"F8 REF"
alias    FT7|FT7-(M1+M2)/2|EEG-FT7|"FT7 REF"
alias    FC5|FC5-(M1+M2)/2|EEG-FC5|"FC5 REF"
alias    FC3|FC3-(M1+M2)/2|EEG-FC3|"FC3 REF"
alias    FC1|FC1-(M1+M2)/2|EEG-FC1|"FC1 REF"
alias    FC2|FC2-(M1+M2)/2|EEG-FC2|"FC2 REF"
alias    FC4|FC4-(M1+M2)/2|EEG-FC4|"FC4 REF"
alias    FC6|FC6-(M1+M2)/2|EEG-FC6|"FC6 REF"
alias    FT8|FT8-(M1+M2)/2|EEG-FT8|"FT8 REF"
alias    T7|T7-(M1+M2)/2|EEG-T7|"T7 REF"
alias    C5|C5-(M1+M2)/2|EEG-C5|"C5 REF"
alias    C3|C3-(M1+M2)/2|EEG-C3|"C3 REF"
alias    C1|C1-(M1+M2)/2|EEG-C1|"C1 REF"
alias    C2|C2-(M1+M2)/2|EEG-C2|"C2 REF"
alias    C4|C4-(M1+M2)/2|EEG-C4|"C4 REF"
alias    C6|C6-(M1+M2)/2|EEG-C6|"C6 REF"
alias    T8|T8-(M1+M2)/2|EEG-T8|"T8 REF"
alias    TP7|TP7-(M1+M2)/2|EEG-TP7|"TP7 REF"
alias    CP5|CP5-(M1+M2)/2|EEG-CP5|"CP5 REF"
alias    CP3|CP3-(M1+M2)/2|EEG-CP3|"CP3 REF"
alias    CP1|CP1-(M1+M2)/2|EEG-CP1|"CP1 REF"
alias    CP2|CP2-(M1+M2)/2|EEG-CP2|"CP2 REF"
alias    CP4|CP4-(M1+M2)/2|EEG-CP4|"CP4 REF"
alias    CP6|CP6-(M1+M2)/2|EEG-CP6|"CP6 REF"
alias    TP8|TP8-(M1+M2)/2|EEG-TP8|"TP8 REF"
alias    P7|P7-(M1+M2)/2|EEG-P7|"P7 REF"
alias    P5|P5-(M1+M2)/2|EEG-P5|"P5 REF"
alias    P3|P3-(M1+M2)/2|EEG-P3|"P3 REF"
alias    P1|P1-(M1+M2)/2|EEG-P1|"P1 REF"
alias    P2|P2-(M1+M2)/2|EEG-P2|"P2 REF"
alias    P4|P4-(M1+M2)/2|EEG-P4|"P4 REF"
alias    P6|P6-(M1+M2)/2|EEG-P6|"P6 REF"
alias    P8|P8-(M1+M2)/2|EEG-P8|"P8 REF"
alias    PO3|PO3-(M1+M2)/2|EEG-PO3|"PO3 REF"
alias    PO4|PO4-(M1+M2)/2|EEG-PO4|"PO4 REF"
alias    O1|O1-(M1+M2)/2|EEG-O1|"O1 REF"
alias    O2|O2-(M1+M2)/2|EEG-O2|"O2 REF"
alias    AFZ|AFZ-(M1+M2)/2|EEG-AFZ|"AFZ REF"
alias    FZ|FZ-(M1+M2)/2|EEG-FZ|"FZ REF"
alias    FCZ|FCZ-(M1+M2)/2|EEG-FCZ|"FCZ REF"
alias    CZ|CZ-(M1+M2)/2|EEG-CZ|"CZ REF"
alias    CPZ|CPZ-(M1+M2)/2|EEG-CPZ|"CPZ REF"
alias    PZ|PZ-(M1+M2)/2|EEG-PZ|"PZ REF"
alias    POz|POz-(M1+M2)/2|EEG-POz|"POz REF"
alias    OZ|OZ-(M1+M2)/2|EEG-OZ|"OZ REF"
alias    A1|A1-(M1+M2)/2|EEG-A1|"A1 REF"
alias    A2|A2-(M1+M2)/2|EEG-A2|"A2 REF"
alias    FPZ|FPZ-(M1+M2)/2|EEG-FPZ|"FPZ REF"
alias    A1|EEG-A1|"A1 REF"
alias    A1|M1|EEG-M1|"M1 REF"
alias    A2|EEG-A2|"A2 REF"
alias    A2|M2|EEG-M2|"M2 REF"
```

Note, it also provides aliases for the mastoids, which are
labelled sometimes as `M1`/`M2`, but mostly as `A1`/`A2`; thus `M1` is
mapped to `A1`, etc. in the last four lines of the `cmaps`.

This file can be _included_ via Luna's `@` syntax, which effectively
reads the file and interprets the entries as `key=value` pairs, where
the two tab-delimited columns are the key and value respectively.  That is,
this will be equivalent to having typed all the alias terms on the Luna command line, as above.
An `@`-included file can also contain
any special variables accepted by Luna (e.g. `path`, etc, as [listed here](https://zzz.bwh.harvard.edu/luna/luna/args/#special-variables)).

To illustrate the effect of aliasing channel labels: here are the
default (sanitized) labels for `M09`:

```{ .sh .codeL }
luna s1.lst  id=M09  -s DESC
```
```
___________________________________________________________________
Processing: M09 [ #19 ]
 duration 08.08.32, 29312s | time 22.00.00 - 06.08.32 | date 01.01.85

 signals: 57 (of 57) selected in a standard EDF file
  Fp1__M1_M2__2 | Fp2__M1_M2__2 | AF3__M1_M2__2 | AF4__M1_M2__2 | F7__M1_M2__2 | F5__M1_M2__2 | F3__M1_M2__2 | F1__M1_M2__2
  F2__M1_M2__2 | F4__M1_M2__2 | F6__M1_M2__2 | F8__M1_M2__2 | FT7__M1_M2__2 | FC5__M1_M2__2 | FC3__M1_M2__2 | FC1__M1_M2__2
  FC2__M1_M2__2 | FC4__M1_M2__2 | FC6__M1_M2__2 | FT8__M1_M2__2 | T7__M1_M2__2 | C5__M1_M2__2 | C3__M1_M2__2 | C1__M1_M2__2
  C2__M1_M2__2 | C4__M1_M2__2 | C6__M1_M2__2 | T8__M1_M2__2 | TP7__M1_M2__2 | CP5__M1_M2__2 | CP3__M1_M2__2 | CP1__M1_M2__2
  CP2__M1_M2__2 | CP4__M1_M2__2 | CP6__M1_M2__2 | TP8__M1_M2__2 | P7__M1_M2__2 | P5__M1_M2__2 | P3__M1_M2__2 | P1__M1_M2__2
  P2__M1_M2__2 | P4__M1_M2__2 | P6__M1_M2__2 | P8__M1_M2__2 | PO3__M1_M2__2 | PO4__M1_M2__2 | O1__M1_M2__2 | O2__M1_M2__2
  AFZ__M1_M2__2 | FZ__M1_M2__2 | FCZ__M1_M2__2 | CZ__M1_M2__2 | CPZ__M1_M2__2 | PZ__M1_M2__2 | POz__M1_M2__2 | OZ__M1_M2__2
  FPZ__M1_M2__2

 annotations:
  Arousal (x91) | SlpStg1 (x45) | SlpStg2 (x472) | SlpStg3 (x257)
  SlpStgREM (x122) | SlpStgWake (x81)
```

If we additionally _@include_ the `cmaps` alias definitions, we see that the channel labels
are now altered on loading. 

```{ .sh .codeL }
luna s1.lst @work/data/auxiliary/cmaps id=M09  -s DESC
```
```
___________________________________________________________________
Processing: M09 [ #19 ]
 duration 08.08.32, 29312s | time 22.00.00 - 06.08.32 | date 01.01.85

 signals: 57 (of 57) selected in a standard EDF file
  Fp1 | Fp2 | AF3 | AF4 | F7 | F5 | F3 | F1
  F2 | F4 | F6 | F8 | FT7 | FC5 | FC3 | FC1
  FC2 | FC4 | FC6 | FT8 | T7 | C5 | C3 | C1
  C2 | C4 | C6 | T8 | TP7 | CP5 | CP3 | CP1
  CP2 | CP4 | CP6 | TP8 | P7 | P5 | P3 | P1
  P2 | P4 | P6 | P8 | PO3 | PO4 | O1 | O2
  AFZ | FZ | FCZ | CZ | CPZ | PZ | POz | OZ
  FPZ

 annotations:
  Arousal (x91) | SlpStg1 (x45) | SlpStg2 (x472) | SlpStg3 (x257)
  SlpStgREM (x122) | SlpStgWake (x81)
```

!!!info  "Channel aliasing"
    For aliased channel labels as above, all output including newly created EDF files will adopt the primary alias term;  however,
    channels can still be referenced in commands from _either_ the primary value or any of the secondary alias terms: e.g. `PSD sig=C3` and `PSD sig=C3__M1_M2__2`
    would both work.


## Sample rates and units

We can also look at the sample rates and physical units of the EEGs.  Re-running the `HEADERS` command with the aliases:

```{ .sh .codeL }
luna s1.lst @work/data/auxiliary/cmaps -o out.db -s HEADERS
```
```{ .sh .codeL }
destrat out.db +HEADERS -r CH -v SR PDIM | head
```
```
ID    CH    PDIM  SR
F01   Fp1   uV    128
F01   Fp2   uV    128
F01   AF3   uV    128
F01   AF4   uV    128
F01   F7    uV    128
F01   F5    uV    128
F01   F3    uV    128
F01   F1    uV    128
F01   F2    uV    128
```


Extracting just the `SR` and `PDIM` fields (3 and 4) and enumerating the number of instances across channels and individuals, we see some variation
in the sample rates and units ( the first column is the count, given by `uniq -c`):
```{ .sh .codeL }
destrat out.db +HEADERS -r CH -v SR PDIM | cut -f3- | sort | uniq -c 
```
```
      PDIM    SR
  59    mV   128
1059    uV   128
  59    uV   150
```

You can look at the full output to see that one individual (`F02`) has
a sample rate of 150 Hz (for all EEGs) whereas most have a rate of 128
Hz; likewise, one individual (`F03`) has mV units whereas most have uV
units.  As subsequent Luna commands are agnostic to the unit
specified, it is important to ensure that records are numerically
well-calibrated to each other, i.e. are on the same physical scale.

Pulling out the results for just the `C3` channel (using the
`factor/level` form for `-r` to reduce output) we can see these
differences:

```{ .sh .codeL }
destrat out.db +HEADERS -r CH/C3 -v SR PDIM
```
```
ID    CH   PDIM  SR
F01   C3   uV    128
F02   C3   uV    150
F03   C3   mV    128
F04   C3   uV    128
F05   C3   uV    128
F06   C3   uV    128
F07   C3   uV    128
F08   C3   uV    128
F09   C3   uV    128
F10   C3   uV    128
M01   C3   uV    128
M02   C3   uV    128
M03   C3   uV    128
M04   C3   uV    128
M05   C3   uV    128
M06   C3   uV    128
M07   C3   uV    128
M08   C3   uV    128
M09   C3   uV    128
M10   C3   uV    128
```


## Generating new EDFs

Given this initial review of the EDF headers, we want to make new EDFs that:

 - ensure uniform sample rate (128 Hz)

 - change all units to micro-volts (uV)

 - apply linked-mastoid referencing to all individuals (except `M09` who has already had this done)

 - drop the mastoids from the new EDFs, as they are no longer needed

!!!info "Workflow decisions"
    Here we are generating new EDFs; in practice, it
    might sometimes be easier to apply these types of changes
    on-the-fly (e.g. if different referencing schemes are required,
    etc).  These choices largely depend on the number and size of
    files, as well as personal preferences.
    

We'll use the `work/harm1` folder as the destination for these new files, which
should have been previously created if you followed the [preparation steps](../prep.md#project-set-up).

Handling `M09` separately (note the `skip` option below), here we perform the above steps:

```{ .sh .codeL }
luna s1.lst @work/data/auxiliary/cmaps skip=M09 \
 -s ' RESAMPLE sr=128
      uV
      REFERENCE sig=${eeg} ref=A1,A2
      SIGNALS drop=A1,A2
      WRITE edf-dir=work/harm1 '
```

It will take a minute or two, but hopefully, the above should process 19 of the 20 individuals and deposit 19 new EDFs into `work/harm1/`

!!!info "Order of parameters"
    Luna expects either an EDF or a
    sample-list (or ASCII data file) as the _first_ argument; also, if
    the script is being given on the command line after `-s` (rather
    than being redirected from standard input), this must be the _last_
    option; otherwise, the order of the options in between generally does not matter
    (i.e. whether `skip` was before or after the _@include_ statement
    above, and likewise if we were specifying an output database with
    `-o` etc).  A minor exception to this rule is that options are
    processed left-to-right, and so sometimes the order can have an
    effect, e.g. for whether an alias has been defined yet, if a
    channel is assigned to a special variable such as `sig`.

!!!info "Multi-line commands"
    Note how we've spread the command out on multiple lines.  We could also have written (with `&` delimiting commands instead of new-lines:
    ```{ .sh .codeL }
    luna s1.lst @work/data/auxiliary/cmaps skip=M09 -s ' RESAMPLE sr=128 & uV & REFERENCE sig=${eeg} ref=A1,A2 & SIGNALS drop=A1,A2 & WRITE edf-dir=work/harm1 '
    ```
    Alternatively, if the file `cmd.txt` contained the script:
    ```
    RESAMPLE sr=128
    uV
    REFERENCE sig=${eeg} ref=A1,A2
    SIGNALS drop=A1,A2
    WRITE edf-dir=work/harm1
    ```
    then we could write (i.e. _redirecting the file to the standard input stream for Luna_):
    ```{ .sh .codeL }
    luna s1.lst @work/data/auxiliary/cmaps skip=M09 < cmd.txt
    ```
    One advantage of using command files, especially for larger scripts, is that comments
    can be added (lines starting `%`), and it makes scripts more reusable:
    ```
    % resample all channels to 128 hz
    RESAMPLE sr=128

    % and scale to micro-volts
    uV

    % re-reference all EEGs against linked mastoids    
    REFERENCE sig=${eeg} ref=A1,A2

    % and then drop the mastoids... 
    SIGNALS drop=A1,A2

    % ...before writing a new EDF to the folder work/harm1
    WRITE edf-dir=work/harm1 
    ```
    

Finally, we'll handle `M09` separately, as we don't need to
re-reference -- or, as it turns out, change the units or resample, so
this step only does the channel label mapping:

```{ .sh .codeL }
luna s1.lst @work/data/auxiliary/cmaps id=M09   -s WRITE edf-dir=work/harm1
```

Let's check that we have the expected EDFs in the new folder:
```{ .sh .codeL }
ls work/harm1
```
```
F01.edf	F03.edf	F05.edf	F07.edf	F09.edf	M01.edf	M03.edf	M05.edf	M07.edf	M09.edf
F02.edf	F04.edf	F06.edf	F08.edf	F10.edf	M02.edf	M04.edf	M06.edf	M08.edf	M10.edf
```

## Canonical signals

Instead of manually performing the above steps (separating out `M09`
from the other studies), it can sometimes be easier to use Luna's
[`CANONICAL`
command](https://zzz.bwh.harvard.edu/luna/ref/canonical/), which is
designed to help when harmonizing multiple sets of EDFs that have
different labels and conventions.

We moved this more involved material to [this _next steps_ page](../p6/canonical.md), which gives  a
description of how we'd use `CANONICAL` to perform the steps performed manually here.


## Next steps

We should now have a new set of EDFs in `work/harm1/`. We'll `--build`
a new sample for these EDFs, but first we need to handle the
annotation files in [this next step](anns.md)


