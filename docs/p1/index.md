# Step 1: file-level QC

The first step of any project typically entails checking the initial
inputs (files) and getting them in a format that Luna can understand.
In this section, we'll work through the following:

 - [checking the basic validity](valid.md) of the files: can we open them?; are they corrupt or in an incorrect format?

 - accounting for partially [truncated EDFs](filefix.md#truncated-edfs)
 
 - [altering annotation file formats](filefix.md#invalid-annotation-file-formats) for compliance with Luna specifications

 - reviewing EDF [header information](hdr.md)

 - identifying and changing [unusual EDF record sizes](recsize.md)

 - reviewing and harmonizing EDF [channel labels](chs.md)

 - reviewing and harmonizing [annotation labels](anns.md)

 - finally, we'll [create a new project](gen.md) for the next round of QC


