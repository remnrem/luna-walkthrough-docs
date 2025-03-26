# Single-page run-through

This reference page contains the basic commands to replicate the
primary steps of the walk-through:

 - creating the QC+ dataset
 - generating the core metrics up to the [association analysis step](p5/assoc.md)

That is, this does _not_ perform all steps in the primary
walk-through, e.g. reviewing data or making plots, etc, and is not a
replacement for following the walk-through. Some secondary analyses
are dropped, and we do not step through details of outputs, etc: see
the primary walk-through for those details. This page is instead
intended, as a complement to the walk-through, to show the overall
flow of commands more clearly. This assumes a Unix-style command line:
Windows users are advised to use a
[Dockerized](https://zzz.bwh.harvard.edu/luna/downloads/docker)
version of Luna, in particular one that includes the [JupyterLab
environment](https://github.com/remnrem/luna-api-notebooks?tab=readme-ov-file#docker-installation)
which will allow the commands below to be run directly.

## [Step 0 : prerequisities](prep.md)

First, we assume the data have already been downloaded and exist in
the current folder as a subfolder called `luna-grins/`.

We clear any working folders:
```{ .sh .codeL}
rm -rf work
```

Make working folder structure:
```{ .sh .codeL}
mkdir -p work/data work/harm1 work/harm2 work/clean
```

Copy data (EDFs, annotations, some auxiliary files) over:
```{ .sh .codeL}
cp -r luna-grins/v2/edfs luna-grins/v2/annots luna-grins/auxiliary work/data/
```

## [Step 1 : file QC](https://zzz.bwh.harvard.edu/luna-walkthrough/p1/valid/)

Make initial sample list, linking EDFs and annotation files:
```{ .sh .codeL}
luna --build work/data -ext=csv,annot,eannot,xml,tsv > s1.lst
```

You'll see a message about an annotation file: 
```
Warning: also found 1 annotation files without a matching EDF:
work/data/annots/F04b.annot
```

Fix the incorrect file name (note: here using Unix-like shell commands: replace with `copy` etc if using
```{ .sh .codeL}
mv work/data/annots/F04b.annot work/data/annots/F04.annot
```

Validate files:
```{ .sh .codeL}
luna --validate -o out.db --options slist=s1.lst
```

This should complain about some remaining files:
```
problem : [F06] corrupt EDF: expecting 370214400 but observed 370210000 bytes: work/data/edfs/F06.edf
problem : [F08] corrupt EDF, file < header size (256 bytes): work/data/edfs/F08.edf
problem : [M01] did not recognize annotation file extension: work/data/annots/M01.csv
problem : [M02] did not recognize annotation file extension: work/data/annots/M02.csv
problem : [M03] bad format for class-inst pairing: 22:00:00
problem : [M04] bad format for class-inst pairing: 22:00:00

  6 of 20 observations scanned had corrupt/missing EDF/annotation files
```

"Fix" corrupt EDFs for `F06` and `F08` (by copying the originals):
```{ .sh .codeL}
cp luna-grins/v1/edfs/F06.edf luna-grins/v1/edfs/F08.edf work/data/edfs/
```

Reformat annotation files for `M01` and `M02` (commas to tabs) using `sed`:
```{ .sh .codeL}
sed 's/,/\t/g' < work/data/annots/M01.csv > work/data/annots/M01.tsv

sed 's/,/\t/g' < work/data/annots/M02.csv > work/data/annots/M02.tsv
```

Reformat annotation files for `M03` and `M04` (changing column order) using `awk`: 
```{ .sh .codeL}
awk ' { print $2 , $1 , $3 } ' OFS="\t" work/data/annots/M03.tsv > xx
mv xx work/data/annots/M03.tsv

awk ' { print $2 , $1 , $3 } ' OFS="\t" work/data/annots/M04.tsv > xx
mv xx work/data/annots/M04.tsv
```

Rebuild the sample list:
```{ .sh .codeL}
luna --build work/data/edfs/ work/data/annots -ext=annot,eannot,xml,tsv > s1.lst
```

And revalidate it:
```{ .sh .codeL}
luna --validate -o out.db --options slist=s1.lst
```

This should give this message:
```
  all good, no problems detected in 20 observations scanned
```

---

Next, review key EDF header information:
```{ .sh .codeL}
luna s1.lst -o out.db -s HEADERS signals
```

Look at EDF type, number of signals, record size and duration:
```{ .sh .codeL}
destrat out.db +HEADERS  -v EDF_TYPE NS TOT_DUR_HMS REC_DUR 
```
```
ID    EDF_TYPE  NS   REC_DUR  TOT_DUR_HMS
F01   EDF+D     59   1        06:58:00
F02   EDF       59   1        07:10:33
F03   EDF       59   1        07:15:24
F04   EDF       59   1        07:18:42
F05   EDF       59   1        07:28:26
F06   EDF       59   1        06:48:30
F07   EDF       59   1        07:52:06
F08   EDF       59   1        07:01:25
F09   EDF       59   1        06:29:53
F10   EDF+D     59   1        07:46:23
M01   EDF       59   1        07:18:05
M02   EDF       59   1        07:22:43
M03   EDF       59   1        07:49:00
M04   EDF       58   1        07:55:32
M05   EDF       59   1        07:46:45
M06   EDF       59   17       07:36:44
M07   EDF       59   1        08:19:20
M08   EDF       59   1        08:11:00
M09   EDF       57   1        08:08:32
M10   EDF+D     59   1        07:33:02
``` 

Changle unusual (17s) record size for `M06`:
```{ .sh .codeL}
luna s1.lst id=M06 -s RECORD-SIZE dur=1 edf-dir=work/data/edfs/ edf=M06-v2

mv work/data/edfs/M06-v2.edf work/data/edfs/M06.edf
```

Reviewing channel-level outputs and console outputs, we note that `M09` already has
linked mastoid channels.

Make harmonized files (except `M09` which has different referencing)
using `work/data/auxiliary/cmaps` which contains mappings, setting all
channels to linked-mastoid referencing and then dropping the mastods
(`A1` and `A2`), and resampling to 128 Hz and ensuring micro-volt
units for all values:

```{ .sh .codeL}
luna s1.lst @work/data/auxiliary/cmaps skip=M09 \
 -s ' RESAMPLE sr=128
      uV
      REFERENCE sig=${eeg} ref=A1,A2
      SIGNALS drop=A1,A2
      WRITE edf-dir=work/harm1 '
```

Make harmonized `M09` (special case):
```{ .sh .codeL}
luna s1.lst @work/data/auxiliary/cmaps id=M09   -s WRITE edf-dir=work/harm1
```

Make new annotation files:
```{ .sh .codeL}
luna s1.lst @work/data/auxiliary/amaps -s ' WRITE-ANNOTS file=work/harm1/^.annot '
```

This should end with 20 new EDFs and 20 matching annotation files in the folder `work/harm1/`.
To make a new sample list for this revised project:
```{ .sh .codeL}
luna --build work/harm1 > harm1.lst
```

Check the new samples:
```{ .sh .codeL}
luna --validate --options slist=harm1.lst
```
```
  all good, no problems detected in 20 observations scanned
```


## [Step 2 : signal QC](https://zzz.bwh.harvard.edu/luna-walkthrough/p2/)

View general headers to these new files:
```{ .sh .codeL}
luna harm1.lst -o out.db -s ' HEADERS & ANNOTS '
```

As above, we'd see that three EDFs are discontinuous (EDF+D); we can generate
statistics for these (e.g. the number of segments):
```{ .sh .codeL}
luna harm1.lst -o out.db id=F01,F10,M10 -s SEGMENTS
```
```{ .sh .codeL}
destrat out.db +SEGMENTS 
```
```
ID  NGAPS  NSEGS
F01    30     30
F10     2      3
M10     2      2
```

Attempt to get hypnogram statistics on segments EDFs: 
```{ .sh .codeL}
luna harm1.lst -o out.db id=F01,F10,M10 -s HYPNO
```
This will show warnings for some individuals:
```
  *** found 211 epoch(s) of 890 with conflicting spanning annotations
```

Repeat after _aligning_ epochs to stage annotations, which handles the above issue and runs without warnings:
```{ .sh .codeL}
luna harm1.lst -o out.db id=F01,F10,M10 -s 'EPOCH align & HYPNO'
```

We'll skip the steps that detected [flat/duplicated channels](p2/dupes.md),
recordings with [unexpected EEG amplitudes](p2/stats.md), or [inverted EEGs](p2/pol.md).
As shown [here](p2/revised.md), we needed to pull the original EDFs for four individuals, which
we'll do here, first making a sample list that points to the _original_ EDFs:x 

Point to the original data:
```{ .sh .codeL}
luna --build luna-grins/v1/edfs luna-grins/v1/annots > s.lst
```

We then update the EDFs for four individuals w/ issues, from that original set:
```{ .sh .codeL}
luna s.lst @work/data/auxiliary/cmaps @work/data/auxiliary/amaps id=F01,F05,F10,M10 \
 -s ' RESAMPLE sr=128 & uV
      REFERENCE sig=${eeg} ref=A1,A2
      SIGNALS drop=A1,A2
      WRITE edf-dir=work/harm1
      WRITE-ANNOTS file=work/harm1/^.annot '
```


## [Step 3 : staging](http://localhost:8000/luna/p3/)

We next summarize the annotations available:
```{ .sh .codeL}
luna harm1.lst -o out.db -s ANNOTS
```
which we can review for one or more individuals, e.g. for `M01`:
```{ .sh .codeL }
destrat out.db +ANNOTS -r ANNOT -i M01
```
```
ID    ANNOT    COUNT       DUR
M01   Arousal    132    1534.0
M01   N1         102      3060
M01   N2         592     17760
M01   N3          61      1830
M01   R           42      1260
M01   W           79      2370
```

We generate hypnogram stats (including epoch-level statistics):
```{ .sh .codeL}
luna harm1.lst -o out.db -s HYPNO epoch
```

Primary individual-level statistics can be extracted as follows, e.g. for total sleep time and
wake after sleep onset:

```{ .sh codeL }
destrat out.db +HYPNO -v TST WASO
```
```
ID      TST    WASO
F01     341    39.5
F02   388.5      12
F03   284.5     125
F04     368    49.5
F05   356.5      71
F06     389      13
F07     317   145.5
F08     354    33.5
F09   365.5    23.5
F10     369    36.5
M01   398.5    34.5
M02     181    21.5
M03     408      35
M04     353      72
M05   417.5      49
M06   350.5   104.5
M07   317.5   102.5
M08     326   153.5
M09     448    25.5
M10   386.5    49.5
```

Single-channel SOAP (forcing all components with `pc`):

```{ .sh .codeL}
luna harm1.lst -o out.db -s ' SOAP sig=C3 pc=0.9  '
```
Extracting the 3-class (NR/R/W) kappas indicates potential issues with `F02`, `F03`, `F04` and `M05`.
```
destrat out.db +SOAP -r CH -v K3
```
```
ID    CH       K3
F01   C3   0.8547
F02   C3   0.4624
F03   C3   0.3803
F04   C3   0.2069
F05   C3   0.8338
F06   C3   0.8238
F07   C3   0.8817
F08   C3   0.7748
F09   C3   0.8529
F10   C3   0.7940
M01   C3   0.7348
M02   C3   0.9150
M03   C3   0.7874
M04   C3   0.8798
M05   C3   0.0000
M06   C3   0.8871
M07   C3   0.8657
M08   C3   0.9132
M09   C3   0.7548
M10   C3   0.8448
```

For `F02`, we extract stages in a plain-text file:

```{ .sh .codeL}
luna harm1.lst id=F02 -s STAGE min > stg.txt
```

And then apply `PLACE`, This suggests the stage annotations are offset by 22 epochs:
```{ .sh .codeL}
luna harm1.lst id=F02 -o out.db -s PLACE sig=C3 stages=stg.txt out=new.eannot
```
```
  optimal epoch offset = -22 epochs (kappa = 0.774458)
  which spans 839 epochs (of 861 in the EDF, and of 861 in the input stages)
```

Alternatively, we can run POPS (automated staging) for all individuals, here based on a single EEG channel (C4):
```{ .sh .codeL}
luna s.lst -o out.db -s RUN-POPS sig=C4 ref=A1 path=work/data/auxiliary/pops
```
and then extract epoch-by-epoch predictions (posterior probabilities and most likely predicted stage) for one or more individuals:
```{ .sh .codeL}
destrat out.db +RUN-POPS -r E -p 4 -v PP_N1 PP_N2 PP_N3 PP_R PP_W PRED | head
```
```
ID   E    PP_N1    PP_N2    PP_N3     PP_R     PP_W  PRED
F01  1   0.0010   0.0019   0.0030   0.0003   0.9938     W
F01  2   0.0011   0.0023   0.0003   0.0003   0.9960     W
F01  3   0.0013   0.0012   0.0001   0.0002   0.9972     W
F01  4   0.0018   0.0014   0.0001   0.0003   0.9964     W
F01  5   0.0010   0.0010   0.0001   0.0002   0.9976     W
F01  6   0.0015   0.0010   0.0001   0.0002   0.9972     W
F01  7   0.0026   0.0018   0.0001   0.0003   0.9952     W
F01  8   0.0030   0.0019   0.0001   0.0003   0.9947     W
F01  9   0.0203   0.0032   0.0001   0.0006   0.9758     W
```

## [Step 4 : artifacts](p4/index.md)

Make a revised project, initially copying all EDFs, then making some adjustments as needed:

```{ .sh .codeL}
cp work/harm1/*edf  work/harm2/
```

We rescale units for `F04`:
```{ .sh .codeL}
luna harm1.lst id=F04 -s ' SET-HEADERS unit=mV & uV & WRITE edf-dir=work/harm2 '
```

We flip EEGs for `F07` and `F09`:
```{ .sh .codeL}
luna harm1.lst id=F07,F09 -s ' FLIP & WRITE edf-dir=work/harm2 ' 
```

We add (as an empty slot) Cz for `M04` (to let it be interpolated below):
```{ .sh .codeL}
luna harm1.lst id=M04 \
  -s ' TRANS sig=CZ expr=" CZ = C1 "
       WRITE edf-dir=work/harm2 '
```

We also copy all annotations:
```{ .sh .codeL}
cp luna-grins/v1/annots/* work/harm2/
```

We can then create a new sample list `harm2.lst`:
```{ .sh .codeL}
luna --build work/harm2 > harm2.lst
```

We perform interpolation, using the information in `luna-grins/auxiliary/badchs.txt` to indicate which
channels should be forced to be interpolated:
```{ .sh .codeL}
luna harm2.lst vars=luna-grins/auxiliary/badchs.txt \
 -o int-out.db \
 -s ' SIGNALS drop=A1,A2
      TAG INTERPOLATE/0
      SIGSTATS epoch
      TAG  .
      CHEP-MASK ch-th=3
      CHEP bad-channels=${badch} channels=0.3
      CHEP-MASK ch-th=2
      CHEP bad-channels=${badch} dump
      INTERPOLATE
      TAG INTERPOLATE/1
      SIGSTATS epoch
      WRITE edf-dir=work/clean '
```

We then build a post-interpolation project in `work/clean/`:
```{ .sh .codeL}
cp work/harm2/*.annot work/clean/
```

We make the final (_clean_) sample list `c.lst`:
```{ .sh .codeL}
luna --build work/clean > c.lst
```

## [Step 5a: derive metrics](p5/index.md)

After generating a cleaned dataset, we then generate metrics in `out/` (Luna output databases) and `res/` (selected text-based outputs from the databases in `out/`):

```{ .sh .codeL}
mkdir -p out res
```

[Macro-architecture metrics](p5/macro.md):

```{ .sh .codeL}
luna c.lst -o out/hypno.db -s HYPNO epoch

destrat  out/hypno.db +HYPNO > res/hypno.base
destrat  out/hypno.db +HYPNO -r SS/N1,N2,N3,R,W > res/hypno.stage
destrat  out/hypno.db +HYPNO -r C/1,2,3,4  > res/hypno.cycle
```

[Spectral analysis metrics](p5/tf.md):

Using the Welch method for all channels, both spectra and band-summaries for N2 and REM:

```{ .sh .codeL}
luna c.lst  -o out/welch.db \
 -s ' FREEZE F1
      TAG stg/N2
      MASK ifnot=N2 & RE
      CHEP-MASK sig=${eeg} ep-th=3,3
      CHEP sig=${eeg} epochs & RE
      PSD sig=${eeg} dB spectrum min=0.5 max=20
      THAW F1
      TAG stg/R
      MASK ifnot=R & RE
      CHEP-MASK sig=${eeg} ep-th=3,3
      CHEP sig=${eeg} epochs & RE
      PSD sig=${eeg} dB spectrum min=0.5 max=20 '

destrat out/welch.db +PSD -r F CH stg/N2 > res/spectral.welch.n2.allchs
destrat out/welch.db +PSD -r F CH stg/R > res/spectral.welch.rem.allchs

destrat out/welch.db +PSD -r B CH stg/N2 > res/spectral.welch.band.n2.allchs
destrat out/welch.db +PSD -r B CH stg/R > res/spectral.welch.band.rem.allchs
```


[Cycle-level dynamics](p5/dynam.md#cycle-level-dynamics):

```{ .sh .codeL}
luna c.lst -o out/cycles.db \
  -s ' ${z=FZ,CZ,PZ,OZ}
       HYPNO annot
       MASK ifnot=N2,N3 & RE
       CHEP-MASK sig=${z} ep-th=3,3
       CHEP sig=${z} epochs & RE
       MASK ifnot=h_cycle_n1
       TAG P/C1
       PSD sig=${z} dB
       MASK ifnot=h_cycle_n2
       TAG P/C2
       PSD sig=${z} dB
       MASK ifnot=h_cycle_n3
       TAG P/C3
       PSD sig=${z} dB
       MASK ifnot=h_cycle_n4
       TAG P/C4
       PSD sig=${z} dB '

destrat out/cycles.db +PSD \
    -r CH P \
    -r B/SLOW,DELTA,THETA,ALPHA,SIGMA,FAST_SIGMA,SLOW_SIGMA,BETA \
    -v PSD > res/dynam.cycles
```

[Epoch-level dynamics](p5/dynam.md#epoch-level-dynamics):
```{ .sh .codeL}
luna c.lst -o out/dynam.db \
  -s ' HYPNO
       MASK ifnot=N2,N3 & RE
       CHEP-MASK sig=CPZ ep-th=3,3
       CHEP epochs & RE
       PSD sig=CPZ dynam dynam-max-cycle=4 dynam-norm-cycles=F '

destrat out/dynam.db +PSD -r CH VAR B QD   > res/dynam.band.1

destrat out/dynam.db +PSD -r CH VAR B Q QD > res/dynam.band.2
```

[Connectivity (PSI) metrics](p5/psi.md#phase-slope-index-psi):

```{ .sh .codeL}
luna c.lst -o out/coh-nrem.db order-signals=T \
  -s ' MASK ifnot=N2 & RE
       CHEP-MASK ep-th=3,3
       CHEP epochs & RE
       MASK random=50 & RE
       PSI sig=${eeg} f-lwr=3 f-upr=19 r=2 w=4 double-entry=F '

luna c.lst -o out/coh-rem.db order-signals=T \
   -s ' MASK ifnot=R & RE
        CHEP-MASK ep-th=3,3
        CHEP epochs & RE
        MASK random=50 & RE
        PSI sig=${eeg} f-lwr=3 f-upr=19 r=2 w=4 double-entry=F '

destrat out/coh-nrem.db +PSI -r CH F > res/psi1.n2
destrat out/coh-rem.db +PSI -r CH F > res/psi1.rem

destrat out/coh-nrem.db +PSI -r CH1 CH2 F > res/psi2.n2
destrat out/coh-rem.db +PSI -r CH1 CH2 F > res/psi2.rem
```

[NREM transients (spindles/SO)](p5/spso.md):

```{ .sh .codeL}
luna c.lst  -o  out/spindles1.db \
  -s ' MASK ifnot=N2 & RE
       CHEP-MASK sig=${eeg} ep-th=3,3
       CHEP sig=${eeg} epochs & RE
       SPINDLES sig=${eeg} fc=11,15 so mag=2 nreps=1000 '

destrat out/spindles1.db +SPINDLES -r F CH -v DENS AMP DUR FRQ NOSC CHIRP > res/spso.spindles

destrat out/spindles1.db +SPINDLES -r CH  > res/spso.slowosc

destrat out/spindles1.db +SPINDLES -r F CH \
     -v CDENS UDENS COUPL_OVERLAP_Z COUPL_MAG_Z  > res/spso.coupl
```

[Age prediction metrics](p5/pad.md):

```{ .sh .codeL}
luna c.lst vars=work/data/auxiliary/master.txt cen=C3,C4 th=3 \
 mpath=work/data/auxiliary/models/ \
 -o out/pad.db < work/data/auxiliary/models/m1-adult-age-luna.txt

destrat out/pad.db +PREDICT > res/pad.base
```


## [Step 5b: association analysis](p5/assoc.md)

We should now have a set of key metrics in `res/` from the above steps:
```{ .sh .codeL }
ls res/
```
```
hypno.base
hypno.stage
hypno.cycle
dynam.cycles
dynam.band.1
dynam.band.2
psi1.n2
psi1.rem
psi2.n2
psi2.rem
spectral.welch.n2.allchs
spectral.welch.rem.allchs
spectral.welch.band.n2.allchs
spectral.welch.band.rem.allchs
spso.spindles
spso.slowosc
spso.coupl
pad.base
```


Different files are _stratified_ by different _factors_, in long-format (i.e. repeated measures on different rows).  The GPA module of Luna can combine all these easily and
perform association analysis.  First just for N2 power metrics (`spectral.welch.n2.allchs`) linked with age/sex information (`work/data/auxiliary/master.txt`).

We first set some variables and make a working folder `gpa/`:

```{ .sh .codeL}
dvs="res/spectral.welch.n2.allchs|psd|CH|F"
ivs="work/data/auxiliary/master.txt|demo"
mkdir -p gpa
```

We make the binary file `gpa/b.n2.spec` with `--gpa-prep`:

```{ .sh .codeL}
echo " inputs=${dvs},${ivs}
       vars=PSD,age,male
       dat=gpa/b.n2.spec " | luna --gpa-prep > gpa/manifest.n2.spec
```

We then run association with `--gpa`, testing for sex differences controlling for age:

```{ .sh .codeL}
luna --gpa -o out/gpa-n2-spec.db \
     --options dat=gpa/b.n2.spec X=male Z=age nreps=10000
```
```
  1649 (prop = 0.3662) significant at nominal p < 0.05
  573 (prop = 0.127249) significant at FDR p < 0.05
  59 (prop = 0.0131024) significant after empirical family-wise type I error control p < 0.05
```

We can see which variables are significant, e.g. with correceted empirical p-values p < 0.01:
```
destrat out/gpa-n2-spec.db +GPA -r X Y | awk ' $7 < 0.01 ' | wc
```

```
destrat out/gpa-n2-spec.db +GPA -r X Y -v STRAT BETA P P_FDR EMPADJ -p 4 | awk ' $4 < 0.02 '  
```
```
ID  X      Y                    EMPADJ        P    P_FDR   STRAT
.   male   PSD_CH_P7_F_3        0.0165   0.0000   0.0130   CH=P7;F=3
.   male   PSD_CH_P7_F_3.25     0.0182   0.0001   0.0130   CH=P7;F=3.25
.   male   PSD_CH_P7_F_14.25    0.0162   0.0000   0.0130   CH=P7;F=14.25
.   male   PSD_CH_P7_F_14.5     0.0121   0.0000   0.0130   CH=P7;F=14.5
.   male   PSD_CH_P7_F_14.75    0.0150   0.0000   0.0130   CH=P7;F=14.75
.   male   PSD_CH_P5_F_14.5     0.0121   0.0000   0.0130   CH=P5;F=14.5
.   male   PSD_CH_P5_F_14.75    0.0123   0.0000   0.0130   CH=P5;F=14.75
.   male   PSD_CH_P5_F_15       0.0153   0.0000   0.0130   CH=P5;F=15
.   male   PSD_CH_P1_F_14.75    0.0176   0.0001   0.0130   CH=P1;F=14.75
.   male   PSD_CH_P1_F_15       0.0172   0.0001   0.0130   CH=P1;F=15
.   male   PSD_CH_PO3_F_14.75   0.0165   0.0001   0.0130   CH=PO3;F=14.75
.   male   PSD_CH_PO3_F_15      0.0165   0.0000   0.0130   CH=PO3;F=15
.   male   PSD_CH_OZ_F_14.75    0.0154   0.0000   0.0130   CH=OZ;F=14.75
.   male   PSD_CH_OZ_F_15       0.0141   0.0000   0.0130   CH=OZ;F=15
.   male   PSD_CH_OZ_F_15.25    0.0163   0.0000   0.0130   CH=OZ;F=15.25
```


We can alternatively run CPT to perform cluster-based association:

```{ .sh .codeL }
luna --cpt -o out/cpt-n2-spec.db \
     --options dv-file=res/spectral.welch.n2.allchs dv=PSD \
               iv-file=work/data/auxiliary/master.txt iv=male covar=age \
               th-freq=0.5 th-spatial=0.5 th-cluster=3 \
               nreps=10000
```
```
  2 clusters significant at corrected empirical P<0.05
```

```{ .sh .codeL }
destrat out/cpt-n2-spec.db +CPT -r K 
```
```
ID   K     N        P   SEED
.    1   367   0.0169   P5~14.5~0~PSD
.    2   271   0.0285   P7~3~0~PSD
```

Finally, we can run GPA for multiple domains, using the pre-defined `specs.json` file to specify which files/variables/factors to use.  We first make
the binary file:

```{ .sh .codeL }
luna --gpa-prep --options dat=gpa/b.dat \
     spec=work/data/auxiliary/specs.json > gpa/manifest
```
```
  preparing inputs...
  ++ res/dynam.band.1: read 20 indivs, 2 base vars --> 140 expanded vars
  ++ res/dynam.band.2: read 20 indivs, 1 base vars --> 500 expanded vars
  ++ res/dynam.cycles: read 20 indivs, 1 base vars --> 128 expanded vars
  ++ res/hypno.base: read 20 indivs, 11 base vars --> 11 expanded vars
  ++ res/hypno.cycle: read 20 indivs, 3 base vars --> 12 expanded vars
  ++ res/hypno.stage: read 20 indivs, 7 base vars --> 35 expanded vars
  ++ res/pad.base: read 20 indivs, 1 base vars --> 1 expanded vars
  ++ res/psi1.n2: read 20 indivs, 1 base vars --> 513 expanded vars
  ++ res/psi1.rem: read 20 indivs, 1 base vars --> 513 expanded vars
  ++ res/psi2.n2: read 20 indivs, 1 base vars --> 14364 expanded vars
  ++ res/psi2.rem: read 20 indivs, 1 base vars --> 14364 expanded vars
  ++ res/spectral.welch.band.n2.allchs: read 20 indivs, 1 base vars --> 570 expanded vars
  ++ res/spectral.welch.band.rem.allchs: read 20 indivs, 1 base vars --> 570 expanded vars
  ++ res/spectral.welch.n2.allchs: read 20 indivs, 1 base vars --> 4503 expanded vars
  ++ res/spectral.welch.rem.allchs: read 20 indivs, 1 base vars --> 4503 expanded vars
  ++ res/spso.coupl: read 20 indivs, 4 base vars --> 456 expanded vars
  ++ res/spso.slowosc: read 20 indivs, 8 base vars --> 456 expanded vars
  ++ res/spso.spindles: read 20 indivs, 6 base vars --> 684 expanded vars
  ++ work/data/auxiliary/master.txt: read 20 indivs, 2 base vars --> 2 expanded vars

  writing binary data (20 obs, 42325 variables) to gpa/b.dat
```

Second, we perform the actual association analyses, with kNN imputation of missing data:

```{ .sh .codeL }
luna --gpa -o out/gpa-full.db \
     --options dat=gpa/b.dat knn=3 X=male Z=age nreps=10000
```
```
  read 20 individuals and 42325 variables from gpa/b.dat
  selected 1 X vars & 1 Z vars, implying 42323 Y vars

  6208 (prop = 0.146688) significant at nominal p < 0.05
  233 (prop = 0.00550554) significant at FDR p < 0.05
  8 (prop = 0.000189031) significant after empirical family-wise type I error control p < 0.05
```

We can review the "hits", e.g. with empirical p-value less than 0.05:

```{ .sh .codeL }
destrat out/gpa-full.db +GPA -r X Y -p 3 | awk ' NR == 1 || $7 < 0.05 '
```
```
ID     X   Y                                      B   BASE    EMP   EMPADJ  GROUP   N   P       P_FDR   STRAT                         T
.   male   PSI_stg_N2_CH1_AF3_CH2_FPZ_F_13   -1.664   PSI   0.000    0.036  psi    20   0.000   0.014   CH1=AF3;CH2=FPZ;F=13;stg=N2   -6.876
.   male   PSI_stg_N2_CH1_F3_CH2_Fp2_F_13    -1.693   PSI   0.000    0.034  psi    20   0.000   0.014   CH1=F3;CH2=Fp2;F=13;stg=N2    -6.909
.   male   PSI_stg_N2_CH1_F5_CH2_FPZ_F_13    -1.746   PSI   0.000    0.004  psi    20   0.000   0.007   CH1=F5;CH2=FPZ;F=13;stg=N2    -8.087
.   male   PSI_stg_N2_CH1_F5_CH2_Fp2_F_13    -1.725   PSI   0.000    0.014  psi    20   0.000   0.014   CH1=F5;CH2=Fp2;F=13;stg=N2    -7.414
.   male   PSI_stg_N2_CH1_F7_CH2_FPZ_F_13    -1.755   PSI   0.000    0.005  psi    20   0.000   0.007   CH1=F7;CH2=FPZ;F=13;stg=N2    -8.060
.   male   PSI_stg_N2_CH1_FC5_CH2_Fp2_F_13   -1.694   PSI   0.000    0.034  psi    20   0.000   0.014   CH1=FC5;CH2=Fp2;F=13;stg=N2   -6.909
.   male   PSI_stg_N2_CH1_FPZ_CH2_FT7_F_13    1.699   PSI   0.000    0.027  psi    20   0.000   0.014   CH1=FPZ;CH2=FT7;F=13;stg=N2    7.046
.   male   PSI_stg_N2_CH1_CP1_CH2_F8_F_17     1.679   PSI   0.000    0.036  psi    20   0.000   0.014   CH1=CP1;CH2=F8;F=17;stg=N2     6.873
```

---

We're all done as far as this _run-through_ goes.  Please (re)visit
the original pages of the walk-through if things aren't clear; you can
also see additional steps and checks implemented there including
visualizing outputs.
