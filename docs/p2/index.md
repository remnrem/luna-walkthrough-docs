# Step 2: signal-level QC

Having completed [Step 1](../p1/index.md), the `harm1.lst` sample list should now describe a dataset that has
consistent channel and annotation labels, consistent annotation
formats (standard `.annot`) and nominally consistent units, sample rates and
referencing.   We can now move on to look at the contents of the EDFs:

 - to describe and handle [recordings with gaps](edfd.md)

 - to identify likely [flat or duplicate signals](dupes.md)

 - to generate some basic [signal summary statistics](stats.md)

 - to spot and fix issues with [EEG polarity](pol.md)
 
Before embarking on these steps, let's check that the harmonization
steps have run as expected, by re-running the `HEADERS` and `ANNOTS`
commands (note: we put these in single-quotes after `-s` to stop the
shell from interpreting `&` as a flag to run a job in the background):

```{ .sh .codeL }
luna harm1.lst -o out.db -s ' HEADERS & ANNOTS '
```

To view the output from `destrat`, we'll combine `awk` (to skip the
first row, and print only the second column) with the usual `sort |
uniq -c` step to count the combinations of channels, units and sample
rates:

```{ .sh .codeL }
destrat out.db +HEADERS -r CH -v SR PDIM | awk ' NR != 1 { print $2 } ' | sort | uniq -c
```

```
  20 AF3    uV    128
  20 AF4    uV    128
  20 AFZ    uV    128
  20 C1     uV    128
  20 C2     uV    128
  20 C3     uV    128
  20 C4     uV    128
  20 C5     uV    128
  20 C6     uV    128
  20 CP1    uV    128
  20 CP2    uV    128
  20 CP3    uV    128
  20 CP4    uV    128
  20 CP5    uV    128
  20 CP6    uV    128
  20 CPZ    uV    128
  19 CZ     uV    128
  20 F1     uV    128
  20 F2     uV    128
  20 F3     uV    128
  20 F4     uV    128
  20 F5     uV    128
  20 F6     uV    128
  20 F7     uV    128
  20 F8     uV    128
  20 FC1    uV    128
  20 FC2    uV    128
  20 FC3    uV    128
  20 FC4    uV    128
  20 FC5    uV    128
  20 FC6    uV    128
  20 FCZ    uV    128
  20 FPZ    uV    128
  20 FT7    uV    128
  20 FT8    uV    128
  20 FZ     uV    128
  20 Fp1    uV    128
  20 Fp2    uV    128
  20 O1     uV    128
  20 O2     uV    128
  20 OZ     uV    128
  20 P1     uV    128
  20 P2     uV    128
  20 P3     uV    128
  20 P4     uV    128
  20 P5     uV    128
  20 P6     uV    128
  20 P7     uV    128
  20 P8     uV    128
  20 PO3    uV    128
  20 PO4    uV    128
  20 POz    uV    128
  20 PZ     uV    128
  20 T7     uV    128
  20 T8     uV    128
  20 TP7    uV    128
  20 TP8    uV    128
```

We see that with one exception (CZ), all channels are seen in all individuals, with the same set of labels applied;
CZ appears only in 19 of 20. 

---

For annotations, we can confirm that all labels have been mapped:

```{ .sh .codeL }
destrat out.db +ANNOTS -r ANNOT | awk ' NR != 1 { print $2 } ' | sort | uniq -c
```

```
  10 Arousal
  19 N1
  20 N2
  19 N3
  19 R
  19 W
```

That is, we see six distinct annotation labels; only half the sample
has `Arousal` annotations marked, but that reflects the original `v2`
data, rather than an issue with the steps we've run. 

We can now move to the [next step, looking at the gapped EDF+](edfd.md) files.
