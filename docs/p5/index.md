# Step 5 : analysis

Having completed [validation and reformatting](../p1/index.md) of input
files, followed by [signal-level QC](../p2/index.md), [staging/annotation
QC](../p3/index.md) and [interpolation](../p4/index.md), we are now ready to
embark on the analysis of these data.

!!!hint "Cheat mode"
    We advise walking through the preparatory and QC steps listed above before this section,
    to gain a better sense of these data and of using Luna.  However, if you skip those steps and wish to
    start here, see the [cheat mode section](#cheat-mode) below that describes how to derive an
    analysis-ready dataset more quickly.

We'll briefly consider ten areas of analysis:

| Domain | Description |
|------|-------|
| [Macro-architecture](macro.md) | Quantifying sleep macro-architecture |
| [Time/frequency analyses](tf.md)| Spectral analyses, includng Welch, multi-taper and IRASA methods |
| [Ultradian dynamics](dynam.md)| Cycle-based and epoch-based NREM dynamics |
| [Connectivity](conn.md)| Time-domain and spectral (phase-slope index) sensor-space connectivity |
| [Dimension reduction](psc.md)| Principal spectral components |
| [NREM transients](spso.md)| Spindle and slow oscillation detection |
| [Age prediction](pad.md)| Model-based predictive analysis |
| [Linear models](assoc.md)| General and cluster-based linear models |
| [Peri-event statistics](peri.md)| Event-locked signal quantification |
| [Interval-based analysis](overlap.md)| Time-domain empirical analysis of events |

We'll primarily consider two classes of question that can be reasonably addressed in
this toy dataset:

 - evidence for sex differences, comparing the 10 female and 10 male
   subjects

 - characterization of within-individual NREM vs REM differences

!!!info "Replication in N = 106 individuals"
    Naturally, this _N_ = 20
    is a toy dataset.  Nonetheless, to gauge whether the key results
    may hold up more generally, we'll apply the same set of analyses
    to _N_ = 106 independent control individuals from the same GRINS
    study, as described in the final [replications section](xxxrepl.md). [_to be added in the near future_]

__This walkthrough is not intended to provide a model for a robust,
publication-quality analysis, whether hypothesis- or data-driven.__ As
such, some of the examples may be cherry picked for didactic purposes.
Nonetheless, for key analyses in which multiple-testing is an issue,
we:

 - directly illustrate empirical methods to correct for
   multiple testing, in the [linear models](assoc.md) step

 - present comparable _replication_ results from the larger remainder
   of the healthy-control individuals from the GRINS study


Naturally, these sections are also not intended to be fully comprehensive
accounts of broad analytic domains; rather, they aim to 
introduce some of the major approaches and features of Luna.  Fuller
appreciation of these methods will come from a) studying the original
underlying methods, and b) careful sensitivity analyses and
sanity-checking of ones own data.


## Cheat mode

If you wish to work directly from [the `v1`
data](../data.md#original-data-v1) (rather than stepping through and
detecting/correcting the manipulations introduced in [the `v2`
data](../data.md#manipulated-data-v2)), you can run the following to
generate the `c.lst` (cleaned sample list) that will be used in the
analytic steps here.


This still assumes you've already copied the
`luna-grins/auxiliary` folder to `work/data/`
as described in [this preparatory step](../prep.md).

__Build a `v1` sample list (`s.lst`)__

```{ .sh .codeL }
luna --build luna-grins/v1/edfs luna-grins/v1/annots/ > s.lst
```

__Re-referencing and interpolation__

The primary differences between the `v1` and the analysis-ready data
(addressed by the script below) are:

 - use of linked mastoid referencing

 - dropping mastoid channels after re-referencing

 - application of epoch-level interpolation to clean up some bad channels/epochs

This takes just under a minute per subject to complete, so set it
running and grab a coffee:
 
```{ .sh .codeL }
luna s.lst vars=luna-grins/auxiliary/badchs.txt \
 -o cheat.db \
 -s ' REFERENCE sig=${eeg} ref=A1,A2
      SIGNALS drop=A1,A2
      CHEP-MASK ch-th=3
      CHEP bad-channels=${badch} channels=0.3
      CHEP-MASK ch-th=2
      CHEP bad-channels=${badch} dump
      INTERPOLATE
      WRITE edf-dir=work/clean
      WRITE-ANNOTS file=work/clean/^.annot hms '
```


__Create a new `c.lst` sample list__


```{ .sh .codeL }
luna --build work/clean > c.lst
```
