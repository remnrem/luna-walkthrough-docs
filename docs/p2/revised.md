# 2.5. Revised project

So far, reviewing the signals has identified the following issues, all
of which correspond to issues [introduced in the manipulated `v2`
data](../data.md#signal-manipulations):

 - `F01`, `F10` and `M10` EDFs had gaps 

 - `F05` had a different bandpass/low-pass filter set

 - `M01` and `M03` had duplicate/flat channels

 - `F04` likely has incorrect physical units specified

 - `F07` and `F09` have flipped EEG polarities

 
!!!info "Other issues"
    Although we also came across a range of other
    more subtle issues, e.g. evidence of artifact/line-noise for some
    channels/periods, we'll deal with those later when applying
    [interpolation](../p4/interp.md).


At this point, before moving to [reviewing staging
annotations](../p3/index.md), we'll deal with the issue of the gapped
recordings.  This is because of how we generated the
[manipulated](../data.md#signal-manipulations), _only shifting the
signals and not the annotations for `M10`_ (purely for didactic
purposes to show the use of `SEGMENTS` and `EDF-MINUS`), for the two
gapped recordings, we're going to retrieve the original, unmanipulated
versions of those (for both `F10` and `M10`).

Also, as we know `F01` only had N2 epochs in the EDF, as we are about
to move to the next step that considers staging data more explicitly,
there is no point to running that _as is_.

Finally, we know that `F05` has an incorrect filter applied: it
doesn't really matter, but as there is no other way to _fix_ that,
we'll retrieve the original for that study too.

We'll leave the other issues _as is_ for now, as a) they won't
directly impact the analysis of staging data, and b) there are other
ways to approach/fix those issues that we'll encounter below, unlike
the scenario for these four more _catastrophic_ cases.

Thus, we will retrieve the four _original_ EDFs (and annotation files)
for these studies.  To make them comparable with the other recordings,
we also need to ensure they are a) re-referenced, b) re-sampled, c) of
the correct units and d) re-labelled as needed too, i.e. rather than
simply copying over the original files.

First, we'll make a sample list that points to the _original_ `v1`
data (note: up until this point, we haven't looked at any of these
_original_ data before):

```{ .sh .codeL }
luna --build luna-grins/v1/edfs luna-grins/v1/annots > s.lst
```
```{ .sh .codeL }
cat s.lst
```
```
F01	luna-grins/v1/edfs/F01.edf	luna-grins/v1/annots/F01.annot
F02	luna-grins/v1/edfs/F02.edf	luna-grins/v1/annots/F02.annot
F03	luna-grins/v1/edfs/F03.edf	luna-grins/v1/annots/F03.annot
F04	luna-grins/v1/edfs/F04.edf	luna-grins/v1/annots/F04.annot
F05	luna-grins/v1/edfs/F05.edf	luna-grins/v1/annots/F05.annot
F06	luna-grins/v1/edfs/F06.edf	luna-grins/v1/annots/F06.annot
F07	luna-grins/v1/edfs/F07.edf	luna-grins/v1/annots/F07.annot
F08	luna-grins/v1/edfs/F08.edf	luna-grins/v1/annots/F08.annot
F09	luna-grins/v1/edfs/F09.edf	luna-grins/v1/annots/F09.annot
F10	luna-grins/v1/edfs/F10.edf	luna-grins/v1/annots/F10.annot
M01	luna-grins/v1/edfs/M01.edf	luna-grins/v1/annots/M01.annot
M02	luna-grins/v1/edfs/M02.edf	luna-grins/v1/annots/M02.annot
M03	luna-grins/v1/edfs/M03.edf	luna-grins/v1/annots/M03.annot
M04	luna-grins/v1/edfs/M04.edf	luna-grins/v1/annots/M04.annot
M05	luna-grins/v1/edfs/M05.edf	luna-grins/v1/annots/M05.annot
M06	luna-grins/v1/edfs/M06.edf	luna-grins/v1/annots/M06.annot
M07	luna-grins/v1/edfs/M07.edf	luna-grins/v1/annots/M07.annot
M08	luna-grins/v1/edfs/M08.edf	luna-grins/v1/annots/M08.annot
M09	luna-grins/v1/edfs/M09.edf	luna-grins/v1/annots/M09.annot
M10	luna-grins/v1/edfs/M10.edf	luna-grins/v1/annots/M10.annot
```

Extracting and processing just these three files __to overwrite the existing files in `harm1` for these four people only__: note the `^` is
swapped out for the ID in the script below for `WRITE-ANNOTS`:

```{ .sh .codeL }
luna s.lst id=F01,F05,F10,M10 \
     @work/data/auxiliary/cmaps \
     @work/data/auxiliary/amaps \
 -s ' RESAMPLE sr=128 & uV
      REFERENCE sig=${eeg} ref=A1,A2
      SIGNALS drop=A1,A2
      WRITE edf-dir=work/harm1
      WRITE-ANNOTS file=work/harm1/^.annot '
```

!!!hint "Two things to note"
    * in this particular case, the original
    files are already all sampled at 128 Hz, and using the desired
    channel and annotation labels; we'll include those steps in any
    case, as they won't make any difference.  The one critical step is
    to apply linked-mastoid referencing, so these data are comparable
    with the others.

    * directly running a command to copy over the existing outputs is
    not necessarily the most reproducible, best-practice; we do it
    here in this walkthrough for convenience, but this should be
    avoided with real data

---

_Assuming_ all went as planned, we can [continue to the next
steps](../p3/index.md) using the `harm1.lst` that points to these
newly created files (i.e. as we just updated the older versions of the
actual EDF and annotation files).


