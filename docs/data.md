# Demonstration data

This demonstration uses a subset of whole-night sleep hd-EEG data from
the GRINS (Global Research Initiative on the Neurophysiology of
Schizophrenia) project (PMID:
[35578829](https://pubmed.ncbi.nlm.nih.gov/35578829/),
[39297495](https://pubmed.ncbi.nlm.nih.gov/39297495/),
[38858652](https://pubmed.ncbi.nlm.nih.gov/38858652/))


## Original data (`v1`)

For the purpose of this walkthrough, the "original" subset of the
GRINS dataset is as follows:

 - 20 high-density (57-channel plus mastoids `A1` and `A2`) whole-night recordings, exported as an [EDF file](https://www.edfplus.info/)

 - 10 males, 10 females, all healthy controls (versus patients with
   schizophrenia in the full GRINS study)

 - EEGs and mastoid channels have been down-sampled to 128 Hz from the original sampling rate of 500 Hz, and
   EOG/EMG channels have been dropped

 - all signals are potentials measured with respect to a common recording (reference) electrode

 - all recordings have manual (AASM) staging and annotated arousals

 - all dates, times and IDs have been swapped out (replaced with start
   times and dates of `22.00.00` and `1.1.85`)

 - the 10 females have assigned IDs `F01` to `F10`; the 10 males have assigned IDs `M01` to `M10`

 - the tab-separated file `luna-grins/auxiliary/master.txt` contains the age (years) of each individual (27 - 45 years); the `luna-grins/auxiliary/` folder
 also contains some other helper files used throughout the demonstration

This reduced subset of the original GRINS dataset is labelled `v1` in this demonstration. 

## Manipulated data (`v2`)

From the _original_ (`v1`) dataset we have created a second
_manipulated_ version (`v2`), in which we have purposefully introduced
variations in standards and conventions as well as several flavors of
data corruption. In particular, changes in the `v2` dataset include:

 - corrupted files (e.g. truncated, scrambled, misaligned or swapped signals or annotations)

 - variable file formats for annotations (and different EDF
   conventions including [record
   size](https://www.edfplus.info/specs/edf.html) and EDF vs
   [EDF+D](https://www.edfplus.info/specs/edfplus.html))

 - changes in signal labels, units, sample rates, polarity and referencing

 - variable pre-filtering

 - duplicated or missing EEG channels

 - gaps in recordings  

The `v2` data are intended to mimic some of the typical issues
encountered when working with real data.  The first four steps in this
demonstration ([file QC](p1/index.md), [signal QC](p2/index.md),
[staging](p3/index.md) and [artifacts](p4/index.md)) follow the steps
of detecting -- and potentially correcting -- some of the (known)
issues with the `v2` data, aiming to recapitulate the original `v1`
dataset as much as possible.  The second stage (ten modules in the
[analysis](p5/index.md) step) is focused on working with a cleaned
_analysis-ready_ (i.e. preprocessed) dataset.

The demonstration is structured this way to showcase Luna's approaches
to data QC and manipulation as well as the "final" analytic steps:
in practice, the former can be just as important and involved as the
latter.

!!!note "Fixes versus redo's"
    Whereas some things can be effectively
    fixed (e.g. interpolating a missing channel), other issues in the
    `v2` dataset are more serious (e.g. completely corrupted/empty
    EDFs) and naturally can't be "fixed" analytically.  In these
    scenarios, in order to make the full N=20 analysis dataset, we
    occasionally retrieve the original (`v1`) files: think of this as
    (in real life) corresponding to having to re-run the study for that person, or
    contacting the data-generating team, e.g. asking them to
    re-export/transfer a new EDF.

For reference, the sections below detail the specific manipulations
introduced in terms of [signals](#signal-manipulations) (EDFs) and
[staging](#annotation-manipulations) (annotation files).  They are not
important to study in detail at this point, but can provide a useful
reference when stepping through the demonstration; we link to these tables throughout the
walkthrough when they are needed.

### Signal manipulations

For reference when working through the demonstration, this table
summarizes the manipulations introduced into the EDFs:

| ID  | Signal manipulations          | Example channel labels | 
|-----|--------------------------------|--------------|
| `F01` | N2 epochs only (EDF+D)        | `Fp1`           |
| `F02` | Different sample rate (150 Hz) | `Fp1`           |
| `F03` | Different unit (mV)            | `Fp1`           |
| `F04` | Wrong unit (mV but says uV)    | `Fp1`           |
| `F05` | Filtered (1-20 Hz)             | `Fp1`           |
| `F06` | Corrupt EDF                    | `Fp1`           |
| `F07` | Flipped EEGs                   | `Fp1`           |
| `F08` | Corrupt EDF                    | `Fp1`           |
| `F09` | Flipped EEGs                   | `Fp1`           |
| `F10` | Gapped (EDF+D, staging aligned)       | `Fp1`           |
| `M01` | Flat midline EEGs                  | `Fp1`           |
| `M02` | _(none)_                               | `Fp1`           |
| `M03` | Duplicate channels (`CZ`->`C3`,`C4`,`F3`,`F4`,`P3`,`P4`)  | `Fp1`      |
| `M04` | Dropped `CZ`                 | `Fp1`           |
| `M05` | _(none)_                           | `fp1`  (_lowercase_)      |
| `M06` | Atypical EDF record size (17s) | `FP1` (_uppercase_)       |
| `M07` | _(none)_                           | `EEG-Fp1`    |
| `M08` | _(none)_                           | `Fp1 REF` (_spaced_)    |
| `M09` | Linked-mastoid referencing | `Fp1-(M1+M2)/2` |
| `M10` | Gapped (EDF+D, staging unaligned) | `A1` -> `M1`, `A2` -> `M2`    |


### Annotation manipulations

Initially, all `v1` annotations were in Luna's [standard `.annot`
format](https://zzz.bwh.harvard.edu/luna/annot), with standard stage
labels (`N1`,`N2`,`N3`,`R` & `W`).  In addition, recordings also have manually
annotated arousals (with the label `Arousal`).

As detailed below, for some individuals, we manipulated either the
labels (e.g. `SlpStg2` instead of `N2`, etc), file formats and/or
timing conventions.  Further, in a few cases we introduced more severe
changes, e.g. shifting the staging relative to the signal data,
truncating the staging information, or completely scrambling it.

For reference when working through the demonstration, this table
summarizes the manipulations introduced into the annotations:

| ID  | Format                | Alternate stage labels   | Introduced errors                        |
|-----|-------------------------------|-----------------------|-------------------------------------|
| `F01` | Standard `.annot`           | .                      | .                                    |
| `F02` | Standard `.annot`           | .                      | Misaligned (+22 epochs)      |
| `F03` | Reduced columns; `+dur` specification; variable durations | `S1`,`S2`,`S3`,`REM`,`Wake`     | File swapped w/ `F04`                       |
| `F04` | Reduced columns; `+dur` specification; variable durations | `S1`,`S2`,`S3`,`REM`,`Wake`     | File swapped w/ `F03` (& mislabeled `F04b.annot`) |
| `F05` | Reduced columns; `...` specification; variable durations  | `S1`,`S2`,`S3`,`REM`,`Wake`     | Misaligned (+0.223s) |
| `F06` | Reduced columns; `...` specification; variable durations  | `S1`,`S2`,`S3`,`REM`,`Wake`     | .                                    |
| `F07` | `.annot` with clock-time (H:M:S)  | `S1`,`S2`,`S3`,`SR`,`SW`        | .                                    |
| `F08` | `.annot` with clock-time (H:M:S)  | `S1`,`S2`,`S3`,`SR`,`SW`        | .                                    |
| `F09` | `.annot` with date/clock-time (D/M/Y-H:M:S) | `1`,`2`,`3`,`5`,`0`             | .                                    |
| `F10` | `.annot` with date/clock-time (D/M/Y-H:M:S) | `1`,`2`,`3`,`5`,`0`             | .                                    |
| `M01` | Comma-delimited (.csv) clock-times     |  .                     | .                                    |
| `M02` | Comma-delimited (.csv) clock-times     |  .                     | Truncated (<500 epochs)        |
| `M03` | Tab-delimited alternate column order; `+dur` specification    | .                      |  . |  
| `M04` | Tab-delimited alternate column order; `+dur` specification     | .                      | . |    
| `M05` | `.eannot` w/ staging only | `n1`,`n2`,`n3`,`r`,`w`| All epochs/rows scrambled      |
| `M06` | `.eannot` w/ staging only | .          | .                                    |
| `M07` | `.eannot` w/ staging only | .          | .                                     |
| `M08` | `.eannot` w/ staging only | .          | .                                    |
| `M09` | Luna/NSRR XML format          | `SlpStg1`, `SlpStg2`, ... |  .                                   |
| `M10` | Luna/NSRR XML format          | `SlpStg1`, `SlpStg2`, ... |  .                                   |



### Example annotations

_You can skim over this section, which is intended for reference._

Here we show a few lines that are representative of the
formatting/labelling variations introduced: in all cases, the lines
convey the same fundamental staging information (but are plus or minus
the arousal annotation):

__Standard .annot (`F01`, `F02`)__
```
W       .      .       2280.000        2310.000        .
N1      .      .       2310.000        2340.000        .
Arousal .      .       2333.500        2354.200        .
N1      .      .       2340.000        2370.000        .
N1      .      .       2370.000        2400.000        .
N1      .      .       2400.000        2430.000        .
N2      .      .       2430.000        2460.000        .
```

The standard form uses start/stop encoding for annotations (columns 4
& 5), with times measured in seconds past the EDF start time. The
periods (`.`) in columns 2, 3 and 6 are unused fields, for the
_instance ID_, associated channel(s), and meta-information.



__Reduced columns, altered labels and duration-encoding (`+dur`) (`F03`, `F04`)__
```
Wake    2280.000    +30
S1      2310.000    +30
Arousal 2333.500    +20.7
S1      2340.000    +30
S1      2370.000    +30
S1      2400.000    +30
S2      2430.000    +30
```

It is permissible to drop columns 2, 3 and 6, in which case Luna
expects an annotation _class_ label, a start time (seconds or
clock-time), and an end time (encoded either as an explicit stop time
(elapsed seconds or clock-time), or alternatively as a duration
(e.g. `+30` means 30 seconds from the start of that event) or (as below) an
indication that the annotation spans until the start of the next
annotation (`...`).

__Reduced columns, altered labels and ellipsis-encoding (`...`) (`F05`, `F06`)__
```
Wake    2280.000    ...
S1      2310.000    ...
S2      2430.000    ...
```

Ellipsis encoding means that the annotation stops at the start
of the next annotation _as ordered in that file_.  Also, here contiguous epochs
of the same stage are implicitly a single annotation (i.e. in multiples of 30 seconds). 
This encoding also means that arousals aren't present in this file; they could be included in a
separate annotation file; alternatively, they could be specified in
this file _prior to_ any ellipsis-encoded annotations, using
start/stop or start/duration encoding.

__Clock-times, altered labels (`F07`, `F08`)__
```
SW      .   .   22:38:00    22:38:30     .
S1      .   .   22:38:30    22:39:00     .
Arousal .   .   22:38:53.5  22:39:14.2   .
S1      .   .   22:39:00    22:39:30     .
S1      .   .   22:39:30    22:40:00     .
S1      .   .   22:40:00    22:40:30     .
S2      .   .   22:40:30    22:41:00     .
```

__Date/clock-times, altered labels (`F09`, `F10`)__
```
0       .   .   1/1/1985-22:38:00    1/1/1985-22:38:30     .
1       .   .   1/1/1985-22:38:30    1/1/1985-22:39:00     .
Arousal .   .   1/1/1985-22:38:53.5  1/1/1985-22:39:14.2   .
1       .   .   1/1/1985-22:39:00    1/1/1985-22:39:30     .
1       .   .   1/1/1985-22:39:30    1/1/1985-22:40:00     .
1       .   .   1/1/1985-22:40:00    1/1/1985-22:40:30     .
2       .   .   1/1/1985-22:40:30    1/1/1985-22:41:00     .
```


__Comma-delimited, clock-times (`M01`, `M02`; nb: _not a valid Luna format_)__
```
W,22:38:00,22:38:30
N1,22:38:30,22:39:00
Arousal,22:38:53.5,22:39:14.2
N1,22:39:00,22:39:30
N1,22:39:30,22:40:00
N1,22:40:00,22:40:30
N2,22:40:30,22:41:00
```
In the demonstration, these files need to be altered before Luna can process them (swap commas with tabs).

__Alternate ordering (`M03`, `M04`; nb. _not a valid Luna format_)__
```
22:38:00    W        +30
22:38:30    N1       +30
22:38:53.5  Arousal  +20.7
22:39:00    N1       +30
22:39:30    N1       +30
22:40:00    N1       +30
22:40:30    N2       +30 
```
In the demonstration, these files need to be altered before Luna can process them (swap column order).

__Basic epoch-level annot (`M05` - `M08`; nb. _no arousal annotations_)__
```
W
N1
N1
N1
N2
```

This simple `.eannot` (epoch-annotation) format lists one (stage)
label per epoch (assumed to be 30 seconds unless otherwise defined by
the user in Luna).

__XML NSRR/Luna format (`M09`, `M10`)__
```
<?xml version="1.0" encoding="UTF-8"?>
<Annotations>
<Instances>

...

<Instance class="SlpStgW">
 <Name>Wake</Name>
 <Start>2280.000</Start>
 <Duration>30</Duration>
</Instance>

<Instance class="SlpStg1">
 <Name>Stage N1</Name>
 <Start>2310.000</Start>
 <Duration>120</Duration>
</Instance>

<Instance class="Arousal">
 <Name>Arousal</Name>
 <Start>2333.500</Start>
 <Duration>20.7</Duration>
</Instance>

<Instance class="SlpStg2">
 <Name>Stage N2</Name>
 <Start>2430.000</Start>
 <Duration>30</Duration>
</Instance>

...

</Instances>
</Annotations>
```

---

Luna supports these different formats on the assumption that getting
your original annotation information into the closest of these types of formats
above should usually not be too difficult (e.g. involving only line-by-line
reformatting rather than more complex manipulations of the information content).

---

## Preparing to embark

To obtain these data and satisfy any other prerequisites of this demonstration (e.g. installation
of core software and other tools), move on to the next step: [0-Prep](prep.md).