# Step 0: project preparation

This page provides notes on obtaining the data and tools necessary for the walkthrough, as well as some general orientation.

## Environments in the walkthrough 

The walkthrough uses several environments:

 - the shell (i.e. a command-line or terminal, assumed to be `bash`) to
   run Luna and perform basic file manipulation tasks

 - R to analyse and visualize outputs from Luna

 - optionally, Python via JupyterLab for viewing raw data (a parallel
   walkthrough based entirely in Python/JupyterLab will be described
   elsewhere)

Commands that should be entered on the shell prompt (including Luna statements) are shown with a gray-blue background: e.g.
```{ .sh .codeL }
luna s.lst -o out.db < cmd.txt
```

Commands that should be executed in R are shown with a sage background: e.g.
```{ .R .codeR }
library(luna)
k <- ldb( "out.db" )
```

All _outputs_ (whether from the shell, Luna or R) are shown with a gray background: e.g.
```
F01.annot   F05.annot   F09.annot   M03.tsv     M07.eannot
F02.annot   F06.annot   F10.annot   M04.tsv     M08.eannot
F03.annot   F07.annot   M01.csv     M05.eannot  M09.xml
F04b.annot  F08.annot   M02.csv     M06.eannot  M10.xml
```

---


In various places throughout the walkthrough, we may refer to performing a set
of commands in a particular context but not always repeat the full
instructions:

| Term | Description |
|-----|------|
| _...in the shell..._ or _...on the command line..._ | implies use `bash` (e.g. `Terminal App` in macOS, or `Terminal` in JupyterLab), e.g. to run `luna` or `destrat` directly |
| _...in R..._ or _...using lunaR..._  | implies opening `R` and running `library(luna)` |
| _...using lunapi..._ or _...in Python..._ | implies opening Python (i.e. via JupyterLab) and running `import lunapi as lp` |  


## Data

The example data (20 whole-night hd-EEG studies) are available from
the [National Sleep Research Resource (NSRR)](http://sleepdata.org).
Put in an application to access the [Luna/GRINS walkthrough
dataset](http://sleepdata.org/datasets/luna-grins/)

!!!warning "Accessing these data via NSRR"
    There may be a delay in the tutorial files being fully available via NSRR, and
    so they may not be posted yet;  please contact `luna.remnrem@gmail.com` in the meantime
    for advice on the timeline.


---

After getting access and downloading these data (potentially
extracting the contents of the archive), you should see a single
folder entitled `orig/`, with three sub-folders, `v1`, `v2` and `aux`:
The files in `aux/` are used at various places in the walkthrough and
will be described at that point.  Not all files in `aux` are listed
here, only some key ones.

| Folder | Contents |
|----|-----|
| `orig/v1` | _Original_ version of the data |
| `orig/v1/edfs` | _Original_ EDFs |
| `orig/v1/annots` | _Original_ annotation files |
|||
| `orig/v2` | _Manipulated_ version of the data |
| `orig/v2/edfs` | _Manipulated_ EDFs |
| `orig/v2/annots` | _Manipulated_ annotation files |
| | |
| `orig/aux/` | _Auxiliary datafiles_ used in the walkthrough | 
| `orig/aux/master.txt` | Basic demographic information (age, sex) |
| `orig/aux/amaps`      | Mapping file for annotations |
| `orig/aux/cmaps`      | Mapping file for channels |
| `orig/aux/badchs.txt` | List of channels to impute |
| `orig/aux/clocs`      | Channel location information |
| | |
| `orig/aux/models/` | Subfolder with age-prediction model files |
| `orig/aux/pops/` | Subfolder with POPS model files |



## Project set-up

We assume all analyses occur in a working folder that contains the above `orig/` folder
as well as a folder named `work`; you can create this from the shell:

```{ .sh .codeL }
mkdir -p work/data work/harm1 work/harm2 work/clean
```
```
   ./ (current folder)
   |
   |---> orig/
   |      |---> v1/
   |      |---> v2/
   |      |---> aux/
   |
   |---> work/
          |---> data/
          |---> harm1/
          |---> harm2/
          |---> clean/
```

As created above, `work/` will contain four sub-folders, which we'll use to
store different iterations of the dataset as it goes through quality
control (QC):

 - `data`: a simple copy of the original folder `orig/v2` (i.e. the _manipulated_ original files)

 - `harm1`: new EDFs and annotations created that are harmonized for basic properties (file format, harmonized labels, etc), based on following [_step 1_](p1/index.md) of this demonstration

 - `harm2`: further harmonized EDFs and annotations, with changes made to give consistent sample rates, units, EEG polarities for a set of standard (ungapped) EDFs, based on following [_step 2_](p2/index.md) and [_step 3_](p3/index.md) of this demonstration

 - `clean`: a final, analysis-ready cleaned dataset, following epoch-level artifact correction as described in [_step 4_](p4/index.md) of this demonstration

To follow the walkthorugh, commands should be executed in the
working (_current folder_ above) that contains both `orig/` and `data/`.

Now we'll populate the new `work/data/` folder with the core elements
needed from `orig/v2`, here listing out the folders/files explicitly
(this step may take half a minute or so):

```{ .sh .codeL }
cp -r orig/v2/edfs orig/v2/annots orig/aux work/data/
```

```{ .sh .codeL }
ls -R work/data
```
```
annots	aux	edfs

work/data/annots:
F01.annot	F05.annot	F09.annot	M03.tsv		M07.eannot
F02.annot	F06.annot	F10.annot	M04.tsv		M08.eannot
F03.annot	F07.annot	M01.csv		M05.eannot	M09.xml
F04b.annot	F08.annot	M02.csv		M06.eannot	M10.xml

work/data/aux:
amaps			female.ids		models
badchs.txt		file.txt		n106.psd.n2.proj
clocs			lm.sigs			pops
cm.sigs			male.ids		specs.json
cmaps			master.txt		step5.sh

work/data/aux/models:
m1-adult-age-data.txt		m1-adult-age-features.txt	m1-adult-age-luna.txt

work/data/aux/pops:
s2.conf		s2.priors	s2.rspec2.svd	s2.spec2a.svd
s2.ftr		s2.ranges	s2.spec1.svd	s2.spec2b.svd
s2.mod		s2.rspec1.svd	s2.spec2.svd	s2.spec2c.svd

work/data/edfs:
F01.edf	F03.edf	F05.edf	F07.edf	F09.edf	M01.edf	M03.edf	M05.edf	M07.edf	M09.edf
F02.edf	F04.edf	F06.edf	F08.edf	F10.edf	M02.edf	M04.edf	M06.edf	M08.edf	M10.edf
```


!!!info "Retrieving the originals"
    All QC steps (steps 1-4 of this
    demonstration are based on the _manipulated_ datasets (`orig/v2`).
    The analysis section (step 5) is based on the _cleaned_ data from
    these steps (which is expected to reside in `work/clean`).  Note
    that occasionally we'll retrieve data from the original
    (pre-manipulation) versions of the data (`orig/v1`), as needed.
    For example, for truncated EDFs, or scrambled stage annotations,
    the QC process can _detect_ there is a problem, but naturally it
    cannot magically fix those problems.  Here, we'll pull the
    originals, which you can think of as corresponding to _calling the
    original investigator/lab that generated the data and requesting a
    re-export, or re-staged file, etc_.


## Tools

### Luna

Obviously, the walkthrough requires that you have an up-to-date
version of Luna available.  See these [installation
notes](https://zzz.bwh.harvard.edu/luna/download/) to obtain
Luna. Luna as [bundled in a Dockerized Jupyter lab
environment](https://github.com/remnrem/luna-api-notebooks?tab=readme-ov-file#lunapi-a-python-interface-for-luna)
may be a good place to start for most new users.  See [below](#docker) for notes on setting this up.

Look at the [initial
tutorial](https://zzz.bwh.harvard.edu/luna/tut/tut1/) as well as the
[command reference](https://zzz.bwh.harvard.edu/luna/ref/) and
[general syntax](https://zzz.bwh.harvard.edu/luna/luna/args/) as needed, to
understand usage of `luna`, `destrat` and `behead` tools.

!!! hint "Using Jupyter lab"
    Note that you can use Jupyter lab to perform both the command-line/R variant of the walkthrough, as well as the
    Python-based variant.  (There are seemingly some minor issues in controlling plot sizes from R if using JupyterLab.)
    

!!! info "Note for Windows users"
    We suggest using Docker and the Jupyter lab environment, which provides a full shell, text editor and comes with all necessary software bundled, including luna compiled as an R library and the Python-based _lunapi_.

### Shell environment

It is important to have basic familiarity with a shell environment,
such as `bash`.  There is a wealth of easily accessible material
online to guide you here, if needed. You should be able to:

 - apply basic command line operations (e.g. moving files, changing directories) 
 - understand the basics of shell redirection and piping, and shell variables
 - use basic `awk` commands (and potentially regular expressions in `grep` and `sed`) 

The walkthrough _does not_ demand particularly deep knowledge of these
things (which are worth learning in any case).

!!! hint "Shell orientation"
    If you are not familiar with the shell
    environment, or are unsure, you might want to review the __[shell
    orientation](#shell-orientation) section below__, which tries to
    review the core set of competencies that will be useful for
    working on the command line when using Luna (or other
    data-oriented command line tools).

### Text-editor

Find a command-line text editor that you are happy with.  If using
Jupyter lab, you can use the built-in text editor.  Otherwise,
popular choices include [Micro](https://micro-editor.github.io/), Atom, Visual Studio Code, as well as classic tools such as nano, pico, vim or emacs.



## Docker

Perhaps the most straightforward way to follow this walkthrough is to
use the `lunapi` Docker container. This includes the command line
version of Luna as well as the R and Python packages in a
platform-agnostic manner.  Further, it provides a terminal/console and
a text-editor that can be used to follow the walkthrough, either via
the command-line path, or primarily using the Python-based `lunapi`
package.

Follow these steps to obtain and start a Dockerized version of the Luna tools:

 - if not already present, install [Docker Desktop](https://www.docker.com/get-started/) on your local machine

 - once installed, obtain the Docker image:
   ```{ .sh .codeL }
   docker pull remnrem/lunapi
   ```

 - start the container
   ```{ .sh .codeL }
   docker run --rm -p 8889:8888 -v ${PWD}:/lunapi/ remnrem/lunapi start-notebook.py --NotebookApp.token='abc'
   ```

 - visit [127.0.0.1:8889](http://127.0.0.1:8889) in your browser, and enter the token `abc` 

 - open a Terminal and a parallel Notebook with an R kernel (and optionally, one with Python 3 as well); you should be able to
 follow all steps toggling between those tabs within Jupyter Lab (with these pages open in another browser, of course)
 

## Shell orientation

!!! warning "More involved material: can be skipped initially"
    This section is more involved and can probably be skipped before diving in... but it is worth returning to, especially
    as how the shell (versus other tools) handles variables is a common source of confusion.

If you can (more or less) follow the logic of the steps below, you'll be in
good shape.  If you can't, try some of the resources linked below to
figure out the answers.

!!!hint "Running these commands"
    You can just look at the commands
    below to check you understand them.  If you want to actually
    execute them too, the file `file.txt` is in the original
    walkthrough folders (`orig/aux/file.txt`).  Alternatively, you can
    make one yourself with a text editor (it should use tabs to
    separate columns for the steps to play out as below).

_Make a temporary folder_
```{ .sh .codeL }
mkdir tmp1
```
_Move into it_
```{ .sh .codeL }
cd tmp1
```
_Copy a pre-existing file from a different folder (`orig/aux/`) in the parent folder (`../`) of this current folder (`.`)_
```{ .sh .codeL }
cp ../orig/aux/file.txt .
```
_Confirm that `file.txt` now exists within the current (`tmp1`) folder_
```{ .sh .codeL }
ls 
```
```
file.txt
```
_Display the contents of the text file with `cat`_
```{ .sh .codeL }
cat file.txt
```
```
Col1  Col2  Col3
A     N     Row one
B     Y     Row two
C     N     Row three
D     Y     Row four
```
_Make a copy of this file in the current folder called `copy.txt`_
```{ .sh .codeL }
cp file.txt copy.txt
```
_But then decide to change its name to `file2.txt`_
```{ .sh .codeL }
mv copy.txt file2.txt
```
_Concatenate the two (identical) files and redirect (`>`) the output to `file3.txt`_
```{ .sh .codeL }
cat file.txt file2.txt > file3.txt
```
_Check the contents of `file3.txt`_
```{ .sh .codeL }
cat file3.txt
```
```
Col1  Col2  Col3
A     N     Row one
B     Y     Row two
C     N     Row three
D     Y     Row four
Col1  Col2  Col3
A     N     Row one
B     Y     Row two
C     N     Row three
D     Y     Row four
```
_Look at only the first N rows of a file (e.g. 3) with `head`_
```{ .sh .codeL }
head -3 file3.txt
```
```
Col1  Col2  Col3
A     N     Row one
B     Y     Row two
```
_Extract only the second column of a file (assuming the fields in the files are tab-delimited)_
```{ .sh .codeL }
cut -f2 file3.txt
```
```
Col2
N
Y
N
Y
Col2
N
Y
N
Y
```
_Count the values in the second column by piping (`|`) the output of `cut` into `sort` (to order all rows) and then `uniq -c` to retain only
unique rows (by merging identical adjacent rows) and counting the number of merged rows_
```{ .sh .codeL }
cut -f2	file3.txt | sort | uniq -c
```
```
   2 Col2
   4 N
   4 Y
```
_We can break up the above multi-step command to check we understand it:_
```{ .sh .codeL }
cut -f2 file3.txt | sort
```
```
Col2
Col2
N
N
N
N
Y
Y
Y
Y
```
_Then sending the output of `sort` to the input of `uniq` but without the count (`-c`) argument_
```{ .sh .codeL }
cut -f2 file3.txt | sort | uniq 
```
```
Col2
N
Y
```
_And to do the same but allowing the commands to span multiple lines, using the `\` character as the final character per line_
```{ .sh .codeL }
cut -f2 file3.txt \
   | sort \
   | uniq
```

_Look at rows from the original `file.txt` after the first (header) row using `awk` (i.e. `NR` means row number)_
```{ .sh .codeL }
awk ' NR > 1 ' file.txt
```
```
A     N     Row one
B     Y     Row two
C     N     Row three
D     Y     Row four
```
_To repeat but extracting only columns 1 and 2 (noting the `condition { action }` form of full `awk` statements, and that `awk` processes a text file row by row)_
```{ .sh .codeL }
awk ' NR > 1 { print $1 , $2 } ' file.txt
```
```
A     N
B     Y
C     N
D     Y
```
_To print entries from column 3 if column 2 has a `Y` value_
```{ .sh .codeL }
awk ' $2 == "Y" { print $3 } ' file.txt
```
```
Row
Row
```
_To realize that (unlike `cut`) by default `awk` delimits columns on whitespace (tabs or spaces), where `NF` is the number of fields (columns) in each row_
```{ .sh .codeL }
awk ' { print NF } ' file.txt
```
```
3
4
4
4
4
```
_To explicitly request tab (`\t`) delimiters only, with `-F`_
```{ .sh .codeL }
awk -F"\t" ' { print NF } ' file.txt
```
```
3
3
3
3
3
```
_To repeat the above (print entries from column 3 if column 2 has a `Y` value) now with the correct tab delimiters_
```{ .sh .codeL }
awk -F"\t" ' $2 == "Y" { print $3 } ' file.txt
```
```
Row two
Row four
```

_(More involved!) To use `awk` variables, conditionals and multi-step
commands, e.g. to print column 2 for odd rows, but column 3 for even
rows (where `%` is the modulus operator).  And additionally setting the
output to be tab-delimited using output field separator (`OFS`) option._

```{ .sh .codeL }
awk -F"\t" ' { even = NR % 2 == 0; c = even ? 3 : 2; l = even ? "Even" : "Odd" }
             { print l , $c } ' OFS="\t" file.txt
```

_Repeating the above, noting that awk (and Luna) commands using `'`-quotes can span multiple lines without `\` characters (and with different `{}` and `;` formatting here, too)_
```{ .sh .codeL }
awk -F"\t" ' {
               even = NR % 2 == 0
               c = even ? 3 : 2
               l = even ? "Even" : "Odd" 
               print l , $c
             } ' OFS="\t" file.txt	     
```

_To use a shell variable to specify, e.g., a file name_
```{ .sh .codeL }
f="file2.txt"
```
```{ .sh .codeL }
cat ${f}
```
```
Col1  Col2  Col3
A     N     Row one
B     Y     Row two
C     N     Row three
D     Y     Row four
```
_To pass a shell variable to `awk` and understand the difference between `$j`, `j` and `${j}` below_
```{ .sh .codeL }
j=2
```
```{ .sh .codeL }
awk -F"\t" ' { print $j } ' j=${j} file.txt
```
```
Col2
N
Y
N
Y
```

---

<H5>Variables</h5>

Obviously there is much more to learn, and `awk` itself has a large
number of options and more involved syntax, but if you can acquire
enough familiarity to be able to follow the logic and note the
(sometimes subtle) syntactic differences between the commands above, you'll be
in good shape. Don't be too put off by what might at first appear to
be idiosyncratic convention and fussy syntax.  _The good news is that a
little knowledge goes a long way (and is not at all dangerous...!)._

For example, in the final example, we first set a _shell variable_
called `j` to a value `2`; when invoking `awk`, we reference the shell
variable (by `${j}`, although `$j` would also work here) and assign it
to a variable that `awk` will understand when processing `file.txt`.
We happen to give the same label here (`j`) but it could be anything,
e.g. `x=${j}`.

Then, when parsing the portion of text inside the single-quoted region
(`'`), which is what `awk` takes as its instructions, `awk` will have
access to that variable. Inside `awk`, the `$` sign means the _column_
number rather than pointing to a variable (as it does in `bash`).
Thus `print $j` is actually interpreted `print $2` which means print
the second column, which is what we have.

It can be handy to play around with the syntax, i.e. this would give the same output, as noted above:

```{ .sh .codeL }
awk -F"\t" ' { print $x } ' x=${j} file.txt
```
whereas this would print something different (can you guess what?):
```{ .sh .codeL }
awk -F"\t" ' { print x } ' x=${j} file.txt
```
and, as a further example, the statement below would give a syntax error from `awk` (as the `{}` brackets are interpreted differently by `bash` than `awk`)
```{ .sh .codeL }
awk -F"\t" ' { print ${x} } ' x=${j} file.txt
```

---

We've labored this distinction about passing variables from the shell into a second program as this often occurs when using Luna on the command line, and it can be
a source of confusion for beginners:

```{ .sh .codeL }
luna s.lst s=${s} -o out.db -s ' PSD sig=${s} dB spectrum max=25 '
```
The first `s=${s}` passes the _shell variable_ to Luna, i.e. if `s` was set to `C4` it would be _identical_ to writing:
```{ .sh .codeL }
luna s.lst s=C4 -o out.db -s ' PSD sig=${s} dB spectrum max=25 '
```

Then _within the Luna script_ (which uses single-quote delimiters like
`awk`) the `${s}` references the _Luna_ variable `s` (not the bash
variable); also note, unlike `awk`, Luna requires the same syntax for
variables, `${x}`.  The key point is that `${s}` refers to something
conceptually different within the Luna script (which could be read from a file)
compared to the shell variable, despite the fact that in this particular example
they are set to the same value (and nominally have the same label too).

Assuming the _shell_ variable `s` is set to `C4`, it is important to
understand these differences, which reflect the way that the shell and
Luna work:
---

_Works as above: but passes shell variable `s` to Luna variable `x`:_
```{ .sh .codeL }
luna s.lst x=${s} -o out.db -s ' PSD sig=${x} dB spectrum max=25 '
```
---

_Works as above: but uses shell variable `s` directly in the command-line Luna script (note double-quotes `"`) rather than explicitly assigning it:_
```{ .sh .codeL }
luna s.lst -o out.db -s " PSD sig=${s} dB spectrum max=25 "
```

---

_Would not work as above: within single quotes `${s}` is not expanded as a shell variable, but rather is passed to Luna literally as `${s}` (rather than the text `C4`); Luna
will then look for a variable `s` but will complain with an error message as it hasn't been defined:_
```{ .sh .codeL }
luna s.lst -o out.db -s ' PSD sig=${s} dB spectrum max=25 '
```

---

_Finally, the statement below would not work as above: although we are telling Luna to define a variable `x` (which will be set to the value `C4`), because the command line is in double-quotes, the shell will try to replace `${x}` as a shell variable before Luna gets to see the command:  but as `x` is not defined as a shell variable, what Luna will actually see is `PSD sig= dB spectrum max=25`
as the shell expands undefined variables to a null string:_ 
```{ .sh .codeL }
luna s.lst -o out.db x=${s} -s " PSD sig=${x} dB spectrum max=25 "
```

---

!!!hint "Key point"
    The key point is to be aware of which tool is doing the interpretation of the variable: the shell (`bash`), or a second tool such as `luna` or `awk`. The context and syntax
    can be used to control these things.

!!!info "More information on shell scripting"
    For more information on shell scripting, you might consider the
    following types of resources that look reasonable from a first glance (but certainly contain much,
    much more information than is required to get started using Luna, so don't feel you need to read it all...):

     - [https://itsfoss.com/bash-scripting-series/](https://itsfoss.com/bash-scripting-series/)
 
     - [https://www.freecodecamp.org/news/bash-scripting-tutorial-linux-shell-script-and-command-line-for-beginners/](https://www.freecodecamp.org/news/bash-scripting-tutorial-linux-shell-script-and-command-line-for-beginners/)


---

Finally, to remove this `tmp1` working folder and all the files therein:
```{ .sh .codeL }
cd ..
rm -rf tmp1
```

Hopefully, this shell orientation was helpful: now let's proceed to
[initial data QC](p1/index.md).
