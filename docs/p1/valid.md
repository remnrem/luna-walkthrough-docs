# 1.1. File validation

## Building a sample list

If you've downloaded the data and followed [this
step](../prep.md#project-set-up) to create and populate the
working directory for this walkthrough, you should see the following:

```{ .sh .codeL }
ls work/data/
```
```
annots	aux	edfs
```

Of initial focus here are the 20 EDFs in `work/data/edfs/` and 20
corresponding annotation files in `work/data/annots`:

```{ .sh .codeL }
ls work/data/edfs
```
```
F01.edf	F03.edf	F05.edf	F07.edf	F09.edf	M01.edf	M03.edf	M05.edf	M07.edf	M09.edf
F02.edf	F04.edf	F06.edf	F08.edf	F10.edf	M02.edf	M04.edf	M06.edf	M08.edf	M10.edf
```
and
```{ .sh .codeL }
ls work/data/annots
```
```
F01.annot	F05.annot	F09.annot	M03.tsv		M07.eannot
F02.annot	F06.annot	F10.annot	M04.tsv		M08.eannot
F03.annot	F07.annot	M01.csv		M05.eannot	M09.xml
F04b.annot	F08.annot	M02.csv		M06.eannot	M10.xml
```

We see a range of different annotation file extensions/formats:
`.annot`, `.eannot`, `.csv`, `.tsv` and `.xml` annotation files; see
[here](../data.md#example-annotations) for examples (and notes on
which formats _aren't_ valid).

---

To build an initial sample list `s1.lst`, we can run the following `--build` command,
which recursively searches one or more folders, and matches EDFs and annotation files based on
(by default) root file names.  Here we explicitly specify the annotation extensions we encountered:

```{ .sh .codeL }
luna --build work/data -ext=csv,annot,eannot,xml,tsv > s1.lst
```

The message in the console indicates that 19 of the 20 individuals were matched:
```
wrote 20 EDFs to the sample list
  1 of which had 0 linked annotation files
  19 of which had 1 linked annotation files

Warning: also found 1 annotation files without a matching EDF:
work/data/annots/F04b.annot
```

It also lists that one annotation file wasn't matched: `F04b.annot`:
this is perhaps the simplest form of error, inconsistent naming of
files, which was one of the [manipulations described
here](../data.md#annotation-manipulations).

The sample list generated is a simple text file (we tend to use `.lst` extension by default, but this is arbitrary: it could be `.txt`, any other extension, or nothing).  Using `cat` to view the contents of the file:

```{ .sh .codeL }
cat s1.lst
```
```
F01	work/data/edfs/F01.edf	work/data/annots/F01.annot
F02	work/data/edfs/F02.edf	work/data/annots/F02.annot
F03	work/data/edfs/F03.edf	work/data/annots/F03.annot
F04	work/data/edfs/F04.edf	.
F05	work/data/edfs/F05.edf	work/data/annots/F05.annot
F06	work/data/edfs/F06.edf	work/data/annots/F06.annot
F07	work/data/edfs/F07.edf	work/data/annots/F07.annot
F08	work/data/edfs/F08.edf	work/data/annots/F08.annot
F09	work/data/edfs/F09.edf	work/data/annots/F09.annot
F10	work/data/edfs/F10.edf	work/data/annots/F10.annot
M01	work/data/edfs/M01.edf	work/data/annots/M01.csv
M02	work/data/edfs/M02.edf	work/data/annots/M02.csv
M03	work/data/edfs/M03.edf	work/data/annots/M03.tsv
M04	work/data/edfs/M04.edf	work/data/annots/M04.tsv
M05	work/data/edfs/M05.edf	work/data/annots/M05.eannot
M06	work/data/edfs/M06.edf	work/data/annots/M06.eannot
M07	work/data/edfs/M07.edf	work/data/annots/M07.eannot
M08	work/data/edfs/M08.edf	work/data/annots/M08.eannot
M09	work/data/edfs/M09.edf	work/data/annots/M09.xml
M10	work/data/edfs/M10.edf	work/data/annots/M10.xml
```

We see that all files except one have been matched; the sample list
format is simply ID, EDF, then annotation files(s).  We could have
made this file by hand, or via Excel, etc, but it is often easier to
use `--build`.

To handle the issue with the mislabelled file: we could manually edit
`s1.lst` and enter the path for `F04b.annot`, which would be perfectly
legitimate, as all core Luna commands don't require that the EDF and
annotation names actually match - this is only a requirement for the
`--build` convenience feature (i.e. how else would it know what to
match with what?).

Instead, we'll rename `F04b.annot` to `F04.annot`:
```{ .sh .codeL }
mv work/data/annots/F04b.annot work/data/annots/F04.annot
```
and rebuild the sample-list:
```{ .sh .codeL }
luna --build work/data -ext=csv,annot,eannot,xml,tsv > s1.lst
```
```
 wrote 20 EDFs to the sample list
   20 of which had 1 linked annotation files
```

Good, you can check but we now appear to have a complete sample list `s1.lst`.

## Validating files

The next step is to verify that all files are in fact valid files,
i.e. that can be opened by Luna as either an EDF or an annotation
file.  Here we use the `--validate` option, saving the output to a
database `out.db` and passing as an option the name of the sample-list (`slist=s1.lst`):

```{ .sh .codeL }
luna --validate -o out.db --options slist=s1.lst
```

```
 validating files in sample list s1.lst

problem: [F06] corrupt EDF: expecting 370214400 but observed 370210000 bytes: work/data/edfs/F06.edf
problem: [F08] corrupt EDF, file < header size (256 bytes): work/data/edfs/F08.edf
problem: [M01] did not recognize annotation file extension: work/data/annots/M01.csv
problem: [M02] did not recognize annotation file extension: work/data/annots/M02.csv
problem: [M03] bad format for class/inst pairing: 22:00:00
problem: [M04] bad format for class/inst pairing: 22:00:00

  6 of 20 observations scanned had corrupt/missing EDF/annotation files
```

Overall, the console log notes that 6 of 20 observations had
corrupt/missing data.  (Recall that these files were [deliberately
manipulated for didactic purposes](../data.md), thus the high failure
rate is expected.)

As well as console output, the `--validate` command saves further information in the output database.  See
[here](https://zzz.bwh.harvard.edu/luna/luna/destrat/) for notes on the syntax of `destrat`, the tool that accompanies Luna
and is designed to extract information from Luna output databases in various text formats:
```{ .sh .codeL }
destrat out.db +VALIDATE
```
```
ID	ANNOTS	EDF
F01	1	1
F02	1	1
F03	1	1
F04	1	1
F05	1	1
F06	1	0
F07	1	1
F08	1	0
F09	1	1
F10	1	1
M01	0	1
M02	0	1
M03	0	1
M04	0	1
M05	1	1
M06	1	1
M07	1	1
M08	1	1
M09	1	1
M10	1	1
```

The table above shows which individuals/files failed (i.e. a `0` in
the output, indicating no valid file was found). We can also output a
list of the actual files (i.e. the same information as given in the
console output):

```{ .sh .codeL }
destrat out.db +VALIDATE -r FILE
```
```
ID	FILE	EXC
F06	work/data/edfs/F06.edf	1
F08	work/data/edfs/F08.edf	1
M01	work/data/annots/M01.csv	1
M02	work/data/annots/M02.csv	1
M03	work/data/annots/M03.tsv	1
M04	work/data/annots/M04.tsv	1
```

In the [next section](filefix.md) we'll therefore examine these files to see a)
what the issues were, and b) whether we can fix them.

