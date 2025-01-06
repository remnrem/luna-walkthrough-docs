# 2.2. Finding flat/duplicate channels

In this section, we will scan for flat or duplicated channels in the
EEG, using the [`DUPES`
command](https://zzz.bwh.harvard.edu/luna/ref/summaries/#dupes):

```{ .sh .codeL }
luna harm1.lst -o out.db -s ' DUPES sig=${eeg} '
```

Note that `${eeg}` is one of Luna's _automatic variables_, which is
populated based on guessing the type of channel from the EDF channel
labels; explicitly, it does not include `A1`/`M1` or `A2`/`M2` which
are `${ref}` channels.  You can of course use different variables if
the above doesn't work for your study; adding `verbose=T` to the
command line (after the sample list, before the `-s` script) will make
Luna print out these variables in full.

The two key output variables are `DUPES` (the number of pairs of
channels that are duplicated with each other) and `FLAT` (the number of
flat channels).  (`INVALID` indicates if the EDF header specification
for the channel is invalid, e.g. identical digital or physical minimum
and maximum values, but can be ignored in this walkthrough.)

```{ .sh .codeL }
destrat out.db +DUPES
```
```
ID  DUPES  FLAT  INVALID
F01     0    0        NA
F02     0    0        NA
F03     0    0        NA
F04     0    0        NA
F05     0    0        NA
F06     0    0        NA
F07     0    0        NA
F08     0    0        NA
F09     0    0        NA
F10     0    0        NA
M01    36    0        0 
M02     0    0        NA
M03    15    0        0 
M04     0    0        NA
M05     0    0        NA
M06     0    0        NA
M07     0    0        NA
M08     0    0        NA
M09     0    0        NA
M10     0    0        NA
```

We see potential issues with two recordings:

 - `M01` has 36 duplicate channel pairs

 - `M03` has 15 duplicate channel pairs


We can see which channels and channel pairs had issues (adding a space between individuals for clarity):
```{ .sh .codeL }
destrat out.db +DUPES -r CH
```
```
ID	CH	DUPE	FLAT
M01	AFZ	1	0
M01	FZ	1	0
M01	FCZ	1	0
M01	CZ	1	0
M01	CPZ	1	0
M01	PZ	1	0
M01	POz	1	0
M01	OZ	1	0
M01	FPZ	1	0

M03	C3	1	0
M03	C4	1	0
M03	F3	1	0
M03	F4	1	0
M03	P3	1	0
M03	P4	1	0
```

We can also get a list of the pairwise duplicates as follows:
```{ .sh .codeL }
destrat out.db +DUPES -r CHS
```
```
ID     CHS      DUPE
M01    AFZ,FZ   1
M01    AFZ,FCZ  1
M01    AFZ,CZ   1
M01    AFZ,CPZ  1
M01    AFZ,PZ   1
M01    AFZ,POz  1
M01    AFZ,OZ   1
M01    AFZ,FPZ  1
M01    FZ,FCZ   1
M01    FZ,CZ    1
M01    FZ,CPZ   1
M01    FZ,PZ    1
M01    FZ,POz   1
M01    FZ,OZ    1
M01    FZ,FPZ   1
M01    FCZ,CZ   1
M01    FCZ,CPZ  1
M01    FCZ,PZ   1
M01    FCZ,POz  1
M01    FCZ,OZ   1
M01    FCZ,FPZ  1
M01    CZ,CPZ   1
M01    CZ,PZ    1
M01    CZ,POz   1
M01    CZ,OZ    1
M01    CZ,FPZ   1
M01    CPZ,PZ   1
M01    CPZ,POz  1
M01    CPZ,OZ   1
M01    CPZ,FPZ  1
M01    PZ,POz   1
M01    PZ,OZ    1
M01    PZ,FPZ   1
M01    POz,OZ   1
M01    POz,FPZ  1
M01    OZ,FPZ   1

M03    C3,C4    1
M03    C3,F3    1
M03    C3,F4    1
M03    C3,P3    1
M03    C3,P4    1
M03    C4,F3    1
M03    C4,F4    1
M03    C4,P3    1
M03    C4,P4    1
M03    F3,F4    1
M03    F3,P3    1
M03    F3,P4    1
M03    F4,P3    1
M03    F4,P4    1
M03    P3,P4    1
```

Obviously, there is something amiss with these datasets: we would not expect to see so many exact duplicates or
flat channels.    Duplicates may arise from electrical bridging (i.e. if too much conductive gel has been applied)
or from software/analytic steps (e.g. accidentally copying/exporting the same information).

How does this compare to [what we know was manipulated](../data.md#signal-manipulations) in the `v2`
dataset? 

 - `M01` was altered to make all midline (`*Z`) EEGs flat (and
   therefore also "duplicated" with one another too)

 - `M03` was altered by copying `CZ` to six other channels:
   `C3`, `C4`, `F3`, `F4`, `P3` and `P4`

No other EDFs had these types of manipulations, as per the
[table](../data.md#signal-manipulations), and so it makes sense that
these two recordings were the only ones flagged.  _However, on closer
inspection_ these do not completely match what we know to be aberrant
with these two recordings. Specifically:

 - for `M01`, channels were set to be flat (i.e. all zeros); although
 we have `DUPES` listed here, there is no indication of `FLAT`
 channels

 - for `M03`, where `CZ` was copied to six other channels, we see the
 six other channels have been flagged (correctly) as duplicates, but
 `CZ` is not listed as a duplicate with the other six, which in theory it should be

What is going on here? Is the `DUPES` command not working properly?
There are two relevant points here:

 1. we ran `DUPES` on the linked-mastoid re-referenced data, and

 2. by default, `DUPES` compares _digital_ values in the EDF, not _physical_ values. 

The first point explains the findings for `M01`: the manipulation in
`v2` impacted only the midline electrodes _as measured with respect to
the recording reference_.  However, the dataset indexed by `harm1.lst`
is looking at __channels re-referenced to linked mastoids__.  The
manipulation of `M01` was intended to describe some type of technical
issue that impacted only those physical midline electrodes, whereas
the mastoid channels were without issue (and so contained non-zero
elements).  The act of re-referencing therefore made originally flat
channels appear to be variable (i.e. all midlines are now equal to `0 -
(A1+A2)/2` ).

As such, `DUPES` correctly detected that the midline
channels were all duplicates of each other, but it was also correct to
note that the channels were not flat, because the re-referenced
channels were indeed not flat.  __Conclusion 1:__ for QC purposes, if
one wants to detect flat channels, it is probably better to do this
prior to making any changes to those channels, i.e.  `DUPES` should be
re-run on the original, _non-rereferenced_ `v2` data.

---

What about `M03`? We didn't see `CZ` listed among the duplicated
channels, despite it being the "source" of all duplicates.  This is
related to the second point mentioned above: by default, `DUPES`
operates on _digital_ and not _physical_ values of the EDF.

!!!info "Digital and physical values in EDF"
    This is a technical point
    but relevant to the issue with `M03`. EDF headers specify both
    _digital_ and _physical_ ranges (min/max values).  The internal
    data are stored as signed 16-bit integers, which should vary only
    between the digital min/max in the header (typically set to the
    largest possible range of -32768 and 32767.  The EDF header also
    specifies _physical_ min/max values, e.g. that might correspond to
    observed range of values measured, e.g. -330.2 and 356.8 (with
    implied micro-volt units).  When a digital value is read from the
    EDF, software such as Luna convert it to a _physical_ value by
    rescaling it to the physical range defined.

When Luna copies a channel, for example, it may adjust the underlying
digital min/max values (as they are largely arbitrary) but
(approximately) preserve the physical values.  __Conclusion 2:__
despite the default of the `DUPES` command being different, it is
often better to run it with the `physical` flag set, which determines
whether two signals are similar based on _physical_ rather than
_digital_ values.  However, when comparing floating point (physical)
values, we need to set an _episilon_ value (the maximum ignorable
difference) as 22.0001 and 22.0002, for example, are effectively
identical given the limited floating-point resolution inherent in
single-precision, 16-bit numerical representations.

We'll re-run `DUPES` with these two changes in place reflecting the
points above: 1) pointing to the original data (`s1.lst` rather than
`harm1.lst`) and 2) adding the `physical` argument:

```{ .sh .codeL }
luna s1.lst -o out.db -s ' DUPES sig=${eeg} physical '
```

Looking at the console output, we see
```
  using epsilon ('eps') = 0.01
  flagging if at least 0.1 proportion of an epoch is discordant based on eps
```

which indicates the default threshold used - i.e. if at least 10% of
the samples in an epoch differ by 0.01 or more between two channels,
then that epoch (and correspondingly, the whole recording) is said not
to be duplicated for that channel pair.

We now see the expected results:
```{ .sh .codeL }
destrat out.db +DUPES
```
```
ID  DUPES  FLAT  INVALID
F01     0     0       NA
F02     0     0       NA
F03     0     0       NA
F04     0     0       NA
F05     0     0       NA
F06     0     0       NA
F07     0     0       NA
F08     0     0       NA
F09     0     0       NA
F10     0     0       NA
M01    36     9       0 
M02     0     0       NA
M03    21     0       0 
M04     0     0       NA
M05     0     0       NA
M06     0     0       NA
M07     0     0       NA
M08     0     0       NA
M09     0     0       NA
M10     0     0       NA
```

and

```{ .sh .codeL }
destrat out.db +DUPES -r CH 
```
```
ID    CH   DUPE FLAT
M01   AFZ  1    1
M01   FZ   1    1
M01   FCZ  1    1
M01   CZ   1    1
M01   CPZ  1    1
M01   PZ   1    1
M01   POz  1    1
M01   OZ   1    1
M01   FPZ  1    1

M03   CZ   1    0
M03   C3   1    0
M03   C4   1    0
M03   F3   1    0
M03   F4   1    0
M03   P3   1    0
M03   P4   1    0
```

That is, as expected, we can now see that:

 - `M01` has all 9 midline channels listed as flat; and naturally, these 9 flat
   channels are all _identically_ flat, and so we have 9 * 8 / 2 = 36
   pairs of "duplicated" channels also

 - `M03` now has 21 (not 15) duplicates pairs, i.e. 7 * 6 / 2 = 21, as
   we have 7 channels _including_ `CZ` that are all duplicated

!!!note "Scaling issues"
    Note that depending on the scaling of the
    channel (e.g. volts versus micro-volts), the specified episilon
    may be too large or too small to make a meaningful comparison
    between channels, when we don't expect them to be numerically
    _exactly_ identical, per se.  You can specify the episilon value to
    use with `DUPES` via the `eps` argument.

    Single (16-bit) precision - as used by EDF - typically provides
    around 7 decimal places of precision.  For example, if we set
    single-precision floating point variable `a` to
    `0.111111111111111` and `b` to `0.222222222222222` then (depending
    on exact platform, compiler, etc), `a+b` is returned not as
    `0.333333333333333` but `0.3333333432674407959`, i.e. reflecting the inherent finiteness
    of a computers standard representation of the infinitesimal resolution of true floating-point numbers. 

---

We've seen how `DUPES` can be used to spot flat channels and
duplicates.  In real settings (and in this walkthorugh), we'd have to
deal with these bad/missing channels, e.g. by interpolation,
re-exporting/re-recording, or simply dropping them.  Below, in a
subsequent step, we'll use interpolation.  As we'll see later, the
`CORREL` and `STATS` command provide other ways to find duplicated
(i.e. excessively high correlation between channels) or flat
(i.e. zero variance) channels.

We can now move to the next component of the walkthrough, where we [look at signal properties](stats.md).