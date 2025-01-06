# Single-page run-through

This reference page contains the basic commands to replicate the
primary steps of the walk-through:

 - creating the QC+ dataset
 - generating the core metrics up to the [association analysis step](p5/assoc.md)

That is, this does _not_ perform all steps in the primary walk-through,
e.g. reviewing data or making plots, etc, and is not a replacement for
following the walk-through.  This assumes a Unix-style command line.


## [Step 0 : prerequisities](prep.md)

We assume the data have already been downloaded and the `.tar` file
exists in the current folder and has been extracted (i.e. to give
`orig/`):

```{ .sh .codeL}
tar -xzvf luna-walkthrough-v1.tar.gz
```

Clear any working folders:
```{ .sh .codeL}
rm -rf work
```

Make working folder structure:
```{ .sh .codeL}
mkdir -p work/data work/harm1 work/harm2 work/clean
```

Copy data (EDFs, annotations, some auxiliary files) over:
```{ .sh .codeL}
cp -r orig/v2/edfs orig/v2/annots orig/aux work/data/
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

"Fix" corrupt EDFs by copying the originals:
```
cp orig/v1/edfs/F06.edf orig/v1/edfs/F08.edf work/data/edfs/
```

Reformat annotation files for `M01` and `M02` (commas to tabs)::
```
sed 's/,/\t/g' < work/data/annots/M01.csv > work/data/annots/M01.tsv

sed 's/,/\t/g' < work/data/annots/M02.csv > work/data/annots/M02.tsv
```

Reformat annotation files for `M03` and `M04` (changing column order)::
```
awk ' { print $2 , $1 , $3 } ' OFS="\t" work/data/annots/M03.tsv > xx
mv xx work/data/annots/M03.tsv

awk ' { print $2 , $1 , $3 } ' OFS="\t" work/data/annots/M04.tsv > xx
mv xx work/data/annots/M04.tsv
```

Rebuild the sample list:
```
luna --build work/data/edfs/ work/data/annots -ext=annot,eannot,xml,tsv > s1.lst
```

Re-validate:
```
luna --validate -o out.db --options slist=s1.lst
```


Review headers:
```
luna s1.lst -o out.db -s HEADERS
```


Changle record size for `M06`:
```
luna s1.lst id=M06 -s RECORD-SIZE dur=1 edf-dir=work/data/edfs/ edf=M06-v2

mv work/data/edfs/M06-v2.edf work/data/edfs/M06.edf
```

Make harmonized files (except `M09` which has different referencing):
```
luna s1.lst @work/data/aux/cmaps skip=M09 \
 -s ' RESAMPLE sr=128
      uV
      REFERENCE sig=${eeg} ref=A1,A2
      SIGNALS drop=A1,A2
      WRITE edf-dir=work/harm1 '
```

Make harmonized `M09` (special case):
```
luna s1.lst @work/data/aux/cmaps id=M09   -s WRITE edf-dir=work/harm1
```

Make new annotation files:
```
luna s1.lst @work/data/aux/amaps -o out.db -s ' WRITE-ANNOTS file=work/harm1/^.annot '
```

Make a new sample list:
```
luna --build work/harm1 > harm1.lst
```

Check the new samples:
```
luna --validate --options slist=harm1.lst
```



## [Step 2 : signal QC](https://zzz.bwh.harvard.edu/luna-walkthrough/p2/)

View general headers:
```
luna harm1.lst -o out.db -s ' HEADERS & ANNOTS '
```

Segmented EDFs (EDF+D) stats:
```
luna harm1.lst -o out.db id=F01,F10,M10 -s SEGMENTS
```

Hypnogram statistics on aligned EDFs:
```
luna harm1.lst -o out.db id=F01,F10,M10 -s 'EPOCH align & HYPNO'
```

Detect flat channels:
```
luna harm1.lst -o out.db -s ' DUPES sig=${eeg} '
```
```
luna s1.lst -o out.db -s ' DUPES sig=${eeg} physical '
```


Whole night Hjorth stats:
```
luna harm1.lst -o out.db -s ' SIGSTATS epoch sig=${eeg} '
```


EEG polarity (NREM) check:
```
luna harm1.lst  s=C3,C4 -o out.db \
 -s ' MASK ifnot=N2,N3
      RE
      FILTER sig=${s} bandpass=0.3,18 tw=1 ripple=0.02
      CHEP-MASK sig=${s} ep-th=3
      CHEP sig=${s} epochs
      RE
      POL sig=${s}
      SPINDLES sig=${s} fc=15 so mag=2 all-spindles ignore-neg-peak nreps=1000 '
```


Point to the original data:
```
luna --build orig/v1/edfs orig/v1/annots > s.lst
```

Update EDFs for four individuals w/ issues, from the original set:
```
luna s.lst @work/data/aux/cmaps @work/data/aux/amaps id=F01,F05,F10,M10 \
 -s ' RESAMPLE sr=128 & uV
      REFERENCE sig=${eeg} ref=A1,A2
      SIGNALS drop=A1,A2
      WRITE edf-dir=work/harm1
      WRITE-ANNOTS file=work/harm1/^.annot '
```



## [Step 3 : staging](http://localhost:8000/luna/p3/)

Check annotations:
```
luna harm1.lst -o out.db -s ANNOTS
```

Hypnogram stats (incl epoch-level stats):
```
luna harm1.lst -o out.db -s HYPNO epoch
```

Cycle-specific PSDs:
```
luna harm1.lst -o out.db id=F02 \
 -s ' HYPNO annot
      MASK ifnot=N2 & RE
      TAG CYC/1 & MASK ifnot=h_cycle_n1
      PSD sig=CZ dB
      TAG CYC/2 & MASK ifnot=h_cycle_n2
      PSD sig=CZ dB 
      TAG CYC/3 & MASK ifnot=h_cycle_n3 
      PSD sig=CZ dB 
      TAG CYC/4 & MASK ifnot=h_cycle_n4
      PSD sig=CZ dB '
```

Single channel SOAP (forcing all components):
```
luna harm1.lst -o out.db -s ' SOAP sig=C3 pc=0.9  '
```

For F02, extract stages:
```
luna harm1.lst id=F02 -s STAGE min > stg.txt
```

And apply PLACE:
```
luna harm1.lst id=F02 -o out.db -s PLACE sig=C3 stages=stg.txt out=new.eannot
```

Run POPS:
```
luna s.lst -o out.db -s RUN-POPS sig=C4 ref=A1 path=work/data/aux/pops
```


## [Step 4 : artifacts](http://localhost:8000/luna/p4/)

Make a revised project:
```
cp work/harm1/*edf  work/harm2/
```

Rescale units for F04:
```
luna harm1.lst id=F04 -s ' SET-HEADERS unit=mV & uV & WRITE edf-dir=work/harm2 '
```

Flip EEGs for F07 and F09:
```
luna harm1.lst id=F07,F09 -s ' FLIP & WRITE edf-dir=work/harm2 ' 
```

Add Cz for M04:
```
luna harm1.lst id=M04 \
  -s ' TRANS sig=CZ expr=" CZ = C1 "
       WRITE edf-dir=work/harm2 '
```

Copy annotations:
```
cp orig/v1/annots/* work/harm2/
```

New sample list:
```
luna --build work/harm2 > harm2.lst
```

Perform interpolation:
```
luna harm2.lst vars=orig/aux/badchs.txt \
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

Build post-interpolation project:
```
cp work/harm2/*.annot work/clean/
```

Make the final (clean) sample list:
```
luna --build work/clean > c.lst
```

Stages for Hjorth plots
```
luna c.lst -o stages.db -s STAGE
```

Filtered and masked Hjorth statistics:
```
luna c.lst -o hjorth.db -s ' MASK ifnot=N2,N3 & RE
                             CHEP-MASK ep-th=4,3 
                             CHEP epochs & RE
                             FILTER bandpass=0.3,35 tw=0.5,5 ripple=0.01,0.01
                             SIGSTATS epoch ' 
```

# --------------------------------------------------------------------------------
## [Step 5 : analysis](http://localhost:8000/luna/p5/)

```
mkdir -p out res
```

Macro-architecture:
```
luna c.lst -o out/hypno.db -s HYPNO epoch

destrat  out/hypno.db +HYPNO > res/hypno.base
destrat  out/hypno.db +HYPNO -r SS/N1,N2,N3,R,W > res/hypno.stage
destrat  out/hypno.db +HYPNO -r C/1,2,3,4  > res/hypno.cycle
```


Spectral analysis:
```
luna c.lst  -o out/spectral.db \
 -s ' ${z=FZ,CZ,PZ,OZ}
      FILTER sig=${z} bandpass=0.3,60 tw=0.3,5 ripple=0.01,0.01
      FREEZE F1
      TAG stg/N2
      MASK ifnot=N2 & RE
      CHEP-MASK sig=${z} ep-th=3,3
      CHEP sig=${z} epochs & RE
      PSD sig=${z} dB spectrum max=30
      MTM sig=${z} epoch max=30 dB tw=15 mean-center
      IRASA sig=${z} dB
      THAW F1
      TAG stg/R
      MASK ifnot=R & RE
      CHEP-MASK sig=${z} ep-th=3,3
      CHEP sig=${z} epochs & RE
      PSD sig=${z} dB spectrum max=30 
      MTM sig=${z} epoch max=30 dB tw=15 mean-center
      IRASA sig=${z} dB '

destrat out/spectral.db +MTM -r F CH stg > res/spectral.mtm
destrat out/spectral.db +PSD -r F CH stg > res/spectral.welch
destrat out/spectral.db +IRASA -r F CH stg > res/spectral.irasa
```

Cycle dynamics:
```
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

Epoch-level dynamics:
```
luna c.lst -o out/dynam.db \
  -s ' HYPNO
       MASK ifnot=N2,N3 & RE
       CHEP-MASK sig=CPZ ep-th=3,3
       CHEP epochs & RE
       PSD sig=CPZ dynam dynam-max-cycle=4 dynam-norm-cycles=F '

destrat out/dynam.db +PSD -r CH VAR B QD   > res/dynam.band.1

destrat out/dynam.db +PSD -r CH VAR B Q QD > res/dynam.band.2
```

Connectivity (PSI):
```
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

Dimension reduction (PSC):
```
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

# PSD PSC
luna --psc -o out/psc-psd-n2.db \
     --options spectra=res/spectral.welch.n2.allchs nc=10 v=PSD f-lwr=0.75 norm

# PSI PSC
luna --psc -o out/psc-psi-n2.db \
     --options spectra=res/psi2.n2 nc=10 v=PSI
```


NREM transients (spindles/SO):

```
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

Age prediction:

```
luna c.lst vars=work/data/aux/master.txt cen=C3,C4 th=3 \
 mpath=work/data/aux/models/ \
 -o out/pad.db < work/data/aux/models/m1-adult-age-luna.txt

destrat out/pad.db +PREDICT > res/pad.base
```


## [Step 5.8: association analysis](p5/assoc/)

dvs="res/spectral.welch.n2.allchs|psd|CH|F"
ivs="work/data/aux/master.txt|demo"

mkdir -p gpa

echo " inputs=${dvs},${ivs}
       vars=PSD,age,male
       dat=gpa/b.n2.spec " | luna --gpa-prep > gpa/manifest.n2.spec

luna --gpa -o out/gpa-n2-spec.db \
     --options dat=gpa/b.n2.spec X=male Z=age nreps=10000

CPT : PSD
```
luna --cpt -o out/cpt-n2-spec.db \
     --options dv-file=res/spectral.welch.n2.allchs dv=PSD \
               iv-file=work/data/aux/master.txt iv=male covar=age \
               th-freq=0.5 th-spatial=0.5 th-cluster=3 \
               nreps=10000
```


GPA: multiple domains:

```
luna --gpa-prep --options dat=gpa/b.dat \
     spec=work/data/aux/specs.json > gpa/manifest

luna --gpa -o out/gpa-full.db \
     --options dat=gpa/b.dat knn=3 X=male Z=age nreps=10000
```

Hits?
```
destrat out/gpa-full.db +GPA -r X Y -p 3 | awk ' NR == 1 || $7 < 0.05 '
```

FDR hits?
```
destrat out/gpa-full.db +GPA -r X Y  | awk ' NR == 1 || $11 < 0.05 '
```

