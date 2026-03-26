# 4.3. Hjorth plots

Here we'll pull and visually review further metrics from
`int-out.db`, created in the previous [interpolation step](interp.md).

## Preparatory steps

Before we do that, we'll make two additional steps, that will help interpret the plots below:

 - extract stage information such that it can be easily aligned with the Hjorth statistics

 - calculate post-interpolation NREM-specific Hjorth metrics _after  
   bandpass filtering and epoch-masking_

The second step here is to obtain metrics that would correspond to the
signal data _as typically used_ in analysis.  We don't perform these
steps as part of the previous generic QC pipeline, as different analyses may
have different requirements.  However, we often won't care about
"artifact" if it is, e.g., specific to wake, falls outside the frequency
range of interest, or is easily handled by dropping a small number of
aberrant epochs.

We'll load the .db files directly into R, and so at this point we'll
just run the Luna commands without any further output extraction using
destrat.

### Extracting stages

To make sure we have stage annotations easily
available within R, given everything has been previously aligned, we can run [`STAGE`](https://zzz.bwh.harvard.edu/luna/ref/hypnograms/#stage):

```{ .sh .codeL }
luna c.lst -o stages.db -s STAGE
```

### Filtered and epoch-masked Hjorth statistics

We'll run the following on the cleaned data: again, this may take a while (e.g. it takes about 20 seconds per recording on this laptop):

```{ .sh .codeL }
luna c.lst -o hjorth.db -s ' MASK ifnot=N2,N3 & RE
                             CHEP-MASK ep-th=4,3 
                             CHEP epochs & RE
                             FILTER bandpass=0.3,35 tw=0.5,5 ripple=0.01,0.01
                             SIGSTATS epoch ' 
```

                      


## Loading the data

Having performed those two extra preparatory steps, we'll first
load all output from the previous [interpolation
step](interp.md) (`int-out.db`) into R -- this may take a minute or
so:

```{ .R .codeR }
library(luna)
k <- ldb( "int-out.db" )
```

Once loaded, we can review the contents of `k` (which is a nested list of data-frames) corresponding to the tables/strata that `destrat` would normally show:

```{ .R .codeR }
lx(k)
```
```
CHEP : CH E CH_E 
INTERPOLATE : BL CH 
SIGSTATS : CH_INTERPOLATE CH_E_INTERPOLATE 
WRITE : INTERPOLATE 
```

Alternatively:
```{ .R .codeR }
str(k)
```
```
> str(k)
List of 4
 $ CHEP       :List of 3
  ..$ CH  :'data.frame':	1140 obs. of  3 variables:
  .. ..$ ID  : chr [1:1140] "F01" "F02" "F03" "F04" ...
  .. ..$ CH  : chr [1:1140] "AF3" "AF3" "AF3" "AF3" ...
  .. ..$ CHEP: num [1:1140] 49 97 352 89 7 69 194 102 268 23 ...
  ..$ E   :'data.frame':	17994 obs. of  3 variables:
  .. ..$ ID  : chr [1:17994] "F01" "F02" "F03" "F04" ...
  .. ..$ E   : int [1:17994] 1 1 1 1 1 1 1 1 1 1 ...
  .. ..$ CHEP: num [1:17994] 8 13 10 12 17 12 8 12 7 13 ...
  ..$ CH_E:'data.frame':	1025658 obs. of  4 variables:
  .. ..$ ID  : chr [1:1025658] "F01" "F02" "F03" "F04" ...
  .. ..$ CH  : chr [1:1025658] "AF3" "AF3" "AF3" "AF3" ...
  .. ..$ E   : int [1:1025658] 1 1 1 1 1 1 1 1 1 1 ...
  .. ..$ CHEP: num [1:1025658] 0 0 1 0 0 0 0 0 0 0 ...
 $ INTERPOLATE:List of 2
  ..$ BL:'data.frame':	20 obs. of  5 variables:
  .. ..$ ID                : chr [1:20] "F01" "F02" "F03" "F04" ...
  .. ..$ NCHEP_INTERPOLATED: num [1:20] 6673 8733 9189 8443 7388 ...
  .. ..$ NE_INTERPOLATED   : num [1:20] 843 861 870 877 896 817 944 842 779 921 ...
  .. ..$ NE_MASKED         : num [1:20] 0 0 0 0 0 0 0 0 0 0 ...
  .. ..$ NE_NONE           : num [1:20] 0 0 0 0 0 0 0 0 0 0 ...
  ..$ CH:'data.frame':	1140 obs. of  4 variables:
  .. ..$ ID              : chr [1:1140] "F01" "F02" "F03" "F04" ...
  .. ..$ CH              : chr [1:1140] "AF3" "AF3" "AF3" "AF3" ...
  .. ..$ NE_INTERPOLATED : num [1:1140] 49 97 352 89 7 69 194 102 268 23 ...
  .. ..$ PCT_INTERPOLATED: num [1:1140] 0.05813 0.11266 0.4046 0.10148 0.00781 ...
 $ SIGSTATS   :List of 2
  ..$ CH_INTERPOLATE  :'data.frame':	2280 obs. of  6 variables:
  .. ..$ ID         : chr [1:2280] "F01" "F02" "F03" "F04" ...
  .. ..$ CH         : chr [1:2280] "AF3" "AF3" "AF3" "AF3" ...
  .. ..$ INTERPOLATE: chr [1:2280] "0" "0" "0" "0" ...
  .. ..$ H1         : num [1:2280] 2514 4304 21073 56485 6187 ...
  .. ..$ H2         : num [1:2280] 0.1882 0.1222 0.0884 0.1068 0.1274 ...
  .. ..$ H3         : num [1:2280] 0.902 0.859 0.842 1.09 0.911 ...
  ..$ CH_E_INTERPOLATE:'data.frame':	2051316 obs. of  7 variables:
  .. ..$ ID         : chr [1:2051316] "F01" "F02" "F03" "F04" ...
  .. ..$ CH         : chr [1:2051316] "AF3" "AF3" "AF3" "AF3" ...
  .. ..$ E          : int [1:2051316] 1 1 1 1 1 1 1 1 1 1 ...
  .. ..$ INTERPOLATE: chr [1:2051316] "0" "0" "0" "0" ...
  .. ..$ H1         : num [1:2051316] 321628 4038 144524 930 8242 ...
  .. ..$ H2         : num [1:2051316] 0.0227 0.2439 0.0912 0.1667 0.0573 ...
  .. ..$ H3         : num [1:2051316] 1.32 1.37 1.57 1.3 1.22 ...
 $ WRITE      :List of 1
  ..$ INTERPOLATE:'data.frame':	20 obs. of  6 variables:
  .. ..$ ID         : chr [1:20] "F01" "F02" "F03" "F04" ...
  .. ..$ INTERPOLATE: chr [1:20] "1" "1" "1" "1" ...
  .. ..$ DUR1       : num [1:20] 25317 25833 26124 26322 26906 ...
  .. ..$ DUR2       : num [1:20] 25317 25833 26124 26322 26906 ...
  .. ..$ NR1        : num [1:20] 25317 25833 26124 26322 26906 ...
  .. ..$ NR2        : num [1:20] 25317 25833 26124 26322 26906 ...
```


## CHEP mask plots

We've already looked at the `INTERPOLATE` output in the [previous
step](interp.md), although we'll retrace some of these steps, looking here at similar output given by 
[`CHEP`](https://zzz.bwh.harvard.edu/luna/ref/masks/#chep)
which tracks the channels/epochs flagged as _bad_ (i.e. _for
interpolation_).  We'll extract this data frame from the list `k` and save as `d`:

```{ .R .codeR }
d <- k$CHEP$CH_E
```

This contains a list of which channels were masked as bad for which
epochs (including those for channels where the entire record was set
as bad):

```{ .R .codeR }
head(d)
```
```
    ID  CH E CHEP
1  F01 AF3 1    0
2  F02 AF3 1    0
3  F03 AF3 1    1
4  F04 AF3 1    0
5  F05 AF3 1    0
6  F06 AF3 1    0
```
```{ .R .codeR }
table( d$CHEP ) 
```
```
     0      1 
856071 169587 
```

That is, about 16% of channel/epoch pairs were flagged for
interpolation.

!!!info "QC on whole records versus conditional on sleep stage"
    Note
    that in this case, for simplicity we applied QC to the _entire
    recordings_, including leading and trailing wake epochs that are
    more likely to be noisy.  Depending on the planned analyses,
    there can be advanatges in retaining the
    full dataset, given we've performed interpolation. However, below
    when performing a further round of analysis-specific epoch-level
    QC, we'll typically do this _conditional on sleep stage(s)_ (as we did above when generating `hjorth.db` in fact).

It can be useful to generate visual summaries of the epochs masked
(as noted, this is similar information from the `INTERPOLATE` command). Here
we'll generate a single plot for `F01`, where the black channel/epochs are those
that were interpolated:

<!---
png( file="vig/docs/imgs/pimp1.png", res=150, height=400, width=1000)
dev.off()
--->

```{ .R .codeR }
par(mar=c(0.5,0.5,0.5,0.5))
lheatmap( d$E, d$CH, d$CHEP, f = d$ID == "F01", col = c("lightgray", "black") )
```

![img](../imgs/pimp1.png)

In the above plot, the x-axis reflects epochs from one individual
(`F01`) and the y-axis reflects different channels.  The black
horizontal stripes would indicate the entire channel was interpolated.

## Matrix plots 2.0

!!!hint "Customizing plots: more advanced material"
    This section deals with tweaking R plots to make them more readily informative
    and match the data at hand.  This shows an example of defining a simple function
    to alter how heatmaps are plot.  You don't need to step through the weeds here, but
    you should at least run the R code (marked [below](#funcdef)) so that the Hjorth plots below work, and
    then [skip to the next section](#hjorth-plots).
    

By default, _lunaR_'s generic `lheatmap()` function orders the y-axis
alphanumerically, which is not necessarily optimal - i.e. the channels are not grouped by
any further, specific topographic considerations.

Although we can use `ltopo.xy()` or other approaches (see [below](#comparison-with-ltopoxy)), sometimes
heatmap/matrix style plots are more convenient. We can improve them
a little by selecting a more intuitive order of channels on the
y-axes.

__Step 1: define an ordering of channels__ 

For 64-channel EEG studies using standard labels, we can use
Luna's default (internal) Cartesian coordinates, bundled here in the `aux/` folder: 

```{ .R .codeR }
clocs <- read.table( "work/data/aux/clocs", header=T, stringsAsFactors=F )
```
```{ .R .codeR }
head(clocs)
```
```
  CH       Y        X       Z N
 FPZ 84.9812   0.0000 -1.7860 1
 FP1 80.7840  26.1330 -4.0011 2
 FP2 80.7840 -26.1330 -4.0011 3
 AFZ 79.0255   0.0000 31.3044 4
 AF3 76.1528  31.4828 20.8468 5
 AF4 76.1528 -31.4828 20.8468 6
...
```

This includes a numeric variable (`N`) that orders the channels; for these plots, we'll
also add a second ordering (and call it `O`): this code is the first section [here](#funcdef).  If you
cut-and-paste and run this (somewhat messy...) code, it will add a
numeric column `O` to `clocs` that orders the channels in a
anteroposterior gradient, grouped in left hemisphere, then midline,
then right hemisphere channels.  (You could obviously specify
different orderings instead.)

After [running this code](#funcdef), we can make a 
topo-plot of this new `O` variable:

<!---
png(file="vig/docs/imgs/clocs1.png",res=150,width=400,height=400)
dev.off()
-->

```{ .R .codeR }
par(mar=c(0,0,0,0))
ltopo.rb( clocs$CH , clocs$O , zeroed=F , sz=1.5)
```
![img](../imgs/clocs1.png)

We see it has the desired properties, i.e. 24 left hemisphere channels
ordered along an _anteroposterior_ gradient, followed by 9 midline
channels similarly ordered, followed by 24 right hemisphere channels
similarly ordered (indicated by the blue-white-red color gradient):

To use this ordering when making a heatmap/matrix plot, we need to
merge in `N` to the data frame (linking it by `CH` label) and then set
the y-axis to be `N` instead of `CH`.  We do this below (taking care
of potential inconsistencies in case between files):

```{ .R .codeR }
d$CH <- toupper( d$CH ) 
m <- merge( d , clocs[ , c("CH","O") ] , by="CH" ) 
```

Now using `m$O` instead of `d$CH`, we can make a plot and annotate it
with color and channel labels:

<!---
png(file="vig/docs/imgs/pimp2.png", width=1000,height=800,res=150)
dev.off()
--->

```{ .R .codeR }
par(mar=c(0.5,2,0.5,0.5))
lheatmap( m$E, m$O, m$CHEP, f = m$ID == "F01"  , col = c("lightgray", "black") )
pos <- seq(0,1,length.out=57)
axis( 2 , at=pos[1:24], chlabs[1:24],  las=2, cex.axis=0.5, lwd=0.2, col.axis = "blue" )
axis( 2 , at=pos[25:33], chlabs[25:33], las=2, cex.axis=0.5, lwd=0.2, col.axis = "gray" )
axis( 2 , at=pos[34:57], chlabs[34:57], las=2, cex.axis=0.5, lwd=0.2, col.axis = "red" )
abline(h=c(24/57,(24+9)/57),col="white",lwd=2)
```
![img](../imgs/pimp2.png)


The above steps (along with some additional tweaks) are implemented in
the function `fplot2()` defined [in the second step below](#funcdef).
We'll use `fplot2()` extensively, later in this page.

---

<a name="funcdef"></a>
__The final function__


If you skipped the above, just copy-and-paste the following to be used
in the [Hjorth plot examples below](#hjorth-plots):

1) _define channel ordering (for this 57-channel case)_

```{ .R .codeR }
clocs <- read.table( "work/data/aux/clocs" , header=T, stringsAsFactors=F )
clocs$CH <- toupper( clocs$CH )
d$CH <- toupper( d$CH )
clocs <- clocs[ clocs$CH %in% toupper( unique( d$CH ) ) , ] 
left  <- clocs[ clocs$X >   0.01 , ]
right <- clocs[ clocs$X <  -0.01 , ]
mid   <- clocs[ abs( clocs$X ) <= 0.01 , ]
left  <- left[ order( left$Y , decreasing = F ) , ]
mid   <- mid[ order( mid$Y , decreasing = F ) , ]
right <- right[ order( right$Y , decreasing = F ) , ]
clocs <- rbind( right , mid, left ) # as image() y-axis go up
clocs$O <- seq( 1 , length( clocs$CH ) )
chlabs <- clocs$CH[ clocs$O ]
chright <- chlabs[ 1:24 ]
chmid  <- chlabs[ 25:33 ]
chleft <- chlabs[ 34:57 ]
pal <- c( rep( "blue", 24 ) , rep( "gray" , 9 ) , rep( "red" , 24 ) ) 
```

2) _define the plot function_

```{ .R .codeR }
# hard-coded to this 57-channel case, but can be easily altered (and
# note, is not particularly performant as is, e.g. for larger studies)
# note, we've added some other functionality here that will be used below, e.g. epochs
fplot2 <- function( d , v , flt = T , col = lturbo(100) ,
                    zlim = NULL , epochs = NULL , show.channels = T )
{
 if ( ! is.null( epochs ) ) d[ ! epochs , v ] <- NA  
 lheatmap( d$E, d$O, d[,v], f = flt , col = col , zlim = zlim )
 pos <- seq(0,1,length.out=57)
 if ( show.channels ) {
  axis( 2 , at=pos[1:24], chlabs[1:24],  las=2, cex.axis=0.5, lwd=0.2, col.axis = "blue" )
  axis( 2 , at=pos[25:33], chlabs[25:33], las=2, cex.axis=0.5, lwd=0.2, col.axis = "gray" )
  axis( 2 , at=pos[34:57], chlabs[34:57], las=2, cex.axis=0.5, lwd=0.2, col.axis = "red" )
 }
 abline(h=c(24/57,(24+9)/57),col="white",lwd=2)
 invisible( range( d[,v] , na.rm=T ) ) 
}
```


## Hjorth plots

Let's use the new Hjorth-plot function ([defined above](#funcdef)) to
review the signals, pre- and post-interpolation.

First, we'll extract the relevant `SIGSTATS` output (it is stratified by a `TAG` called `INTERPOLATE` becase we added
that in the script; it has level values of `0` and `1` indicating whether the statistics are from the pre- and post-interpolation
data, respectively).  As before, we'll immediately log-scale the `H1` metric too, and check the number of rows/columns:

```{ .R .codeR }
d <- k$SIGSTATS$CH_E_INTERPOLATE
d$H1 <- log( d$H1 ) 
dim(d)
```
```
[1] 2051316       7
```

---

We'll also attach the staging information just created at the top of this step (from running `STAGE`, saved in `stages.db`):
```{ .R .codeR }
q <- ldb( "stages.db" )
lx(q)
ss <- q$STAGE$E[ , c("ID", "E", "OSTAGE" ) ]
names(ss)[3] <- "SS" 
head(ss)
```
```
   ID E  SS
1 F01 1   W
2 F02 1   W
3 F03 1   W
4 F04 1   W
5 F05 1   W
6 F06 1   W
```

We'll merge in the stage information information to `d`:
```{ .R .codeR }
d <- merge( d , ss , by=c("ID","E") ) 
```
We can check this worked as expected (always very important...):

```{ .R .codeR }
dim(d)
```
```
[1] 2051316       8
```

Good, we've retained all rows (i.e. same as above) and just added a
new `SS` column (7 -> 8) to `d`, the Hjorth data.

---

Finally, we have to ensure that the `clocs$O` channel-ordering derived
above is merged into the dataframe. As above, here we'll simply overwrite the
`d` dataframe rather than creating a new one as above (first ensuring
channel labels match irrespective of case, as `clocs$CH` is all
uppercase):

```{ .R .codeR }
d$CH <- toupper( d$CH ) 
d <- merge( d , clocs[ , c("CH","O") ] , by="CH" ) 
dim(d)
```
```
[1] 2051316       9
```

Good, this retains all rows, just adding a new column (`O`, the channel ordering):

```{ .R .codeR }
head(d)
```
```
   CH  ID   E INTERPOLATE        H1         H2        H3 SS  O
1 AF3 F01   1           0 12.681152 0.02267513 1.3245432  W 56
2 AF3 F03 275           1 10.278365 0.02300388 0.7805656 N1 56
3 AF3 M02  15           1  4.975398 0.28541238 1.2369414  W 56
4 AF3 M10 557           1  7.433838 0.05490234 1.0816763 N2 56
5 AF3 F10 135           0  6.331469 0.15504532 0.8300202 N2 56
6 AF3 F10 446           0  5.849470 0.24466336 1.0327512  R 56
```

(_Note:_ not that it matters here, but note that the merging has
introduced an arbitrary order of rows here, and `d` is no longer
sorted by epoch (`E`).  The commands below are not impacted by this,
but be aware if you want to run other analyses that are.)

---

We can now make plots with `fplot2()`, e.g. for `F02` where we have
observed some channel-specific artifact.  We'll use the default
`fplot2()` palette, which is a _turbo_ blue-green-red style gradient;
we'll also force the z-axes to be the same between the two plots, so
they can be directly compared.

`F02` pre-interpolation:
<!---
png(file="vig/docs/imgs/pimp3.png",res=150,width=1000,height=800)
dev.off()
--->

```{ .R .codeR }
par(mar=c(0.5,2,0.5,0.5))
fplot2( d , "H2" , f = d$ID == "F02" & d$INTERPOLATE == 0 , zlim = c(0,2) )
```
![img](../imgs/pimp3.png)


`F02` post-interpolation:
<!---
png(file="vig/docs/imgs/pimp4.png",res=150,width=1000,height=800)
par(mar=c(0.5,2,0.5,0.5))
dev.off()
--->
```{ .R .codeR }
fplot2( d , "H2" , f = d$ID == "F02" & d$INTERPOLATE == 1 , zlim = c(0,2) )
```
![img](../imgs/pimp4.png)


That is, this is exactly what we'd hope for: the channel-specific
outlier epochs (seen mainly in CP1 and CP3) have effectively been removed.  However,
also as expected, _potential_ outliers  that impacted all channels
(e.g. near the beginning of the night for all/most left-hemisphere
channels) remain as is. Naturally, interpolation cannot work magic if
all/most channels are bad.  (Note, however, in this case the data includes a
wake period and so for this individual, a) this could reflect natural
waking activity rather than technical artifact per se, and b) as such,
it will be removed during analyses of sleep.)


## Comparison with ltopo.xy()

We can compare these to the equivalent _lunaR_ `ltopo.xy()` plots for the same data (H2 for `F02` pre- and post-interpolation):

`F02` pre-interpolation:

<!---
png(file="vig/docs/imgs/pimp3xy.png",res=150,width=1000,height=800)
par(mar=c(0.5,2,0.5,0.5))
dev.off()
--->

```{ .R .codeR }
ltopo.xy( d$CH, d$E, d$H2, z=d$H2, pch=20, col=lturbo(100),
 f=d$ID == "F02" & d$INTERPOLATE == 0,
 zlim=c(0,2), cex=0.2, xlab="Epoch", ylab="H2" )
```
![img](../imgs/pimp3xy.png)

`F02` post-interpolation:

<!---
png(file="vig/docs/imgs/pimp4xy.png",res=150,width=1000,height=800)
par(mar=c(0.5,2,0.5,0.5))
dev.off()
--->

```{ .R .codeR }
ltopo.xy( d$CH, d$E, d$H2, z=d$H2, pch=20, col=lturbo(100),
 f=d$ID == "F02" & d$INTERPOLATE == 1,
 zlim=c(0,2), cex=0.2, xlab="Epoch", ylab="H2" )
```
![img](../imgs/pimp4xy.png)


You may have a preference for one mode of presentation versus the
other.  Naturally, if channel densities are much higher than ~60 then
the `ltopo.xy()` will breakdown, but the heatmap/matrix approach will
still work well.

## Stage-specific maps

Given we've attached the sleep stage label, we can easily take a look
at this. Using the `epochs` argument of `fplot2()` as defined above,
we select to plot only a subset of epochs (but retain those rows and
so still have spaces in the plot, unlike the `f` argument).   

`F02` post-interpolation (__N2 epochs only__):

<!---
png(file="vig/docs/imgs/pimp5.png",res=150,width=1000,height=800)
par(mar=c(0.5,2,0.5,0.5))
dev.off()
--->

```{ .R .codeR }
fplot2(d, "H2",
       f = d$ID == "F02" & d$INTERPOLATE == 1,
       epochs = d$SS == "N2", zlim=c(0,2) )
```
![img](../imgs/pimp5.png)

`F02` post-interpolation (__W epochs only__):

<!---
png(file="vig/docs/imgs/pimp6.png",res=150,width=1000,height=800)
par(mar=c(0.5,2,0.5,0.5))
dev.off()
--->

```{ .R .codeR }
fplot2(d, "H2",
       f= d$ID == "F02" & d$INTERPOLATE == 1,
       epochs = d$SS == "W", zlim=c(0,2) )
```
![img](../imgs/pimp6.png)

---

## Filtered/masked data

For comparison, we can also review the equivalent Hjorth statistics but from the post-interpolation dataset, i.e.
based on signals (mirroring those used in many typical sleep EEG analyses) that:

 - have been band-pass filtered in a frequency range associated with typical scalp EEG sleep activity (here 0.3 - 35 Hz)

 - have been restricted to NREM (N2 + N3) sleep, and then subject to 
 an additional layer of epoch-wise artifact rejection: removing all
 epochs for which _any channel_ was an outlier (conservatively, +/- 4
 SD units, then +/- 3 SD units).  This differs from the prior use of
 `CHEP-MASK`, which in the interpolation step was used only to flag
 channel/epoch (CH/EP = CHEP) combinations that might benefit from
 interpolation.  In this case, given we're now looking at a set of 
 post-interpolation, stage-specific and filtered signals, we
 instead _remove_ flagged epochs (those with at least one flagged channel) from downstream analyses. This leaves the EDFs
 untouched, as these choices will be stage/analysis/channel
 dependent.

Given we created the `hjorth.db` database in the step
[above](#filtered-and-epoch-masked-hjorth-statistics), we'll load them
in R alongside the earlier Hjorth metrics, here as `u` (also repeating
the same steps, of log-scaling H1, attaching stage labels and adding
the channel-location variable for plotting):

```{ .R .codeR }
u <- ldb( "hjorth.db" )
u <- u$SIGSTATS$CH_E
u$H1 <- log( u$H1 ) 
u$CH <- toupper( u$CH )
u <- merge( u , ss , by=c("ID","E") )
u <- merge( u , clocs[,c("CH","O")] , by= "CH" )
```

Overall we have 492,594 rows in `u`, where each row is one channel for one
QC+ N2/N3 epoch, for all 20 individuals.  Reviewing the distribution of
the Hjorth parameters over the entire dataset, we now see quite clean,
normally-distributed patterns with few or no real outliers:

<!---
png( file= "vig/docs/imgs/pimp-u.png" , res=150, width=1000, height=400)
dev.off()
--->

```{ .R .codeR }
par(mfcol=c(1,3))
hist( u$H1 , breaks=40 , col = rgb( 200,0,0,100,max=255) , ylab = "log(H1)" , xlab="", main="N2+N3 Hjorth activity" )
hist( u$H2 , breaks=40 , col = rgb( 0,200,0,100,max=255) , ylab = "H2" , xlab="", main="N2+N3 Hjorth mobility" )
hist( u$H3 , breaks=40 , col = rgb( 0,0,200,100,max=255) , ylab = "H3" , xlab="", main="N2+N3 Hjorth complexity" )
```
![img](../imgs/pimp-u.png)


The suggestion of bimodality for the _mobility_ (H2) parameters
appears to reflect the distinction between N2 and N3 sleep:
stratifying the above plot by N2 versus N3 sleep, we now see two
unimodal, slightly shifted distributions:

<!---
png( file= "vig/docs/imgs/pimp-u2.png" , res=150, width=1000, height=800)
dev.off()
--->

```{ .R .codeR }
par(mfrow=c(2,3))
hist( u$H1[u$SS=="N2"], breaks=40, col=rgb(200,0,0,100,max=255), ylab="log(H1)", xlab="", main="N2 Hjorth activity")
hist( u$H2[u$SS=="N2"], breaks=40, col=rgb(0,200,0,100,max=255), ylab="H2", xlab="", main="N2 Hjorth mobility")
hist( u$H3[u$SS=="N2"], breaks=40, col=rgb(0,0,200,100,max=255), ylab="H3", xlab="", main="N2 Hjorth complexity")

hist( u$H1[u$SS=="N3"], breaks=40, col=rgb(200,0,0,100,max=255), ylab="log(H1)", xlab="", main="N3 Hjorth activity")
hist( u$H2[u$SS=="N3"], breaks=40, col=rgb(0,200,0,100,max=255), ylab="H2", xlab="", main="N3 Hjorth mobility")
hist( u$H3[u$SS=="N3"], breaks=40, col=rgb(0,0,200,100,max=255), ylab="H3", xlab="", main="N3 Hjorth complexity")
```
![img](../imgs/pimp-u2.png)

That is, as expected, comparing N2 and N3 metrics confirms that N3
sleep comprises more higher amplitude (H1) and slower (H2)
oscillations.  We'll use these Hjorth statistics in the plots below,
to put the post-interpolation QC results in context.


## Final maps

Here we'll loop over all individuals to generate plots for all Hjorth
metrics.  In this context, we'll use a reduced form of the plots so
they render better on this webpage, removing channel labels with
`show.channels=F` (given we now know the ordering, as above).

Here we generate a panel of plots for each individual. Each individual
figure is an epoch (columns) by channel (rows) matrix, with channels
ordered as above. The three panel columns show H1, H2 and H3 metrics,
from left to right respectively. The four rows of the panel are:

 - pre-interpolation metrics, all epochs/stages

 - post-interpolation metrics, all epochs/stages

 - post-interpolation metrics, N2+N3 epochs only

 - post-interpolation metrics recalculated for filtered and
   epoch-masked EDFs, N2+N3 epochs only (_and with different
   z-normalization in the plots_)

With respect the the _normalization_ used, because the data in `u` are
from signals that are filtered, the values (especially for H1) are not
directly comparable (i.e. H1 values are orders of magnitude lower).  We'll
therefore normalize the plots for the `u` metrics differently, using the
comparable value across all 20 individuals:

```{ .R .codeR }
ulim1 <- range( u$H1 , na.rm=T )
ulim2 <- range( u$H2 , na.rm=T )
ulim3 <- range( u$H3 , na.rm=T )
```

In contrast, below, the interpolation-pipeline metrics are defined
within individual, fixed to the pre-interpolation values.  Normalizations (for the z/color scale
are passed via the `zlim` argument of `fplot2()`.

The output of the script below is shown in full in the sections below, which
plots every individual.

!!!info "M01 flat midline channels"
    Recall that `M01` had flat midline
    channels and so we forced them to be "bad" and tuhs interpolated; note that in
    the (top, pre-interpolation row) [Hjorth plots below for `M01`](#m01) the _re-referenced_ midline channels are no
    longer flat, _but will solely reflect activity at the mastoids_.
    As we've flagged them as bad based on our initial
    review of the signals, it means we don't need to worry about the contents of these
    channels, as they be interpolated in any case and not impact the interpolation of other channels.

<!---
png(file=paste("vig/docs/imgs/pimp-ind-",id,".png",sep=""),res=150,width=1000,height=800)
dev.off()
--->

```{ .R .codeR }
ids <- sort( unique(d$ID) ) 

for (id  in ids ) {

 cat(id,"\n")

 par(mfcol=c(4,3), mar=c(0.5,0.5,0.5,0.5))
 di <- d[ d$ID == id , ]
 ui <- u[ u$ID == id , ]

 # kludge: splice in the removed epochs, i.e. so plots align on x-axes
 ui <- merge( ui , unique( di[ , c("E","O") ] ) , by=c("E","O") , all.y = T ) 

 zlim1 <- range( di$H1 , na.rm=T )
 zlim2 <- range( di$H2 , na.rm=T )
 zlim3 <- range( di$H3 , na.rm=T )

 fplot2(di,"H1",f=di$INTERPOLATE==0,zlim=zlim1,show.channels=F)
 fplot2(di,"H1",f=di$INTERPOLATE==1,zlim=zlim1,show.channels=F)
 fplot2(di,"H1",f=di$INTERPOLATE==1,zlim=zlim1,epochs=di$SS%in%c("N2","N3"),show.channels=F)
 fplot2(ui,"H1",zlim=ulim1,epochs=ui$SS%in%c("N2","N3"),show.channels=F)

 fplot2(di,"H2",f=di$INTERPOLATE==0,zlim=zlim2,show.channels=F)
 fplot2(di,"H2",f=di$INTERPOLATE==1,zlim=zlim2,show.channels=F)
 fplot2(di,"H2",f=di$INTERPOLATE==1,zlim=zlim2,epochs=di$SS%in%c("N2","N3"),show.channels=F)
 fplot2(ui,"H2",zlim=ulim2,epochs=ui$SS%in%c("N2","N3"),show.channels=F)

 fplot2(di,"H3",f=di$INTERPOLATE==0,zlim=zlim3,show.channels=F)
 fplot2(di,"H3",f=di$INTERPOLATE==1,zlim=zlim3,show.channels=F)
 fplot2(di,"H3",f=di$INTERPOLATE==1,zlim=zlim3,epochs=di$SS%in%c("N2","N3"),show.channels=F)
 fplot2(ui,"H3",zlim=ulim3,epochs=ui$SS%in%c("N2","N3"),show.channels=F)
  
}
```

### F01 
![img](../imgs/pimp-ind-F01.png)

### F02 
![img](../imgs/pimp-ind-F02.png)

### F03
![img](../imgs/pimp-ind-F03.png)

### F04
![img](../imgs/pimp-ind-F04.png)

### F05
![img](../imgs/pimp-ind-F05.png)

### F06
![img](../imgs/pimp-ind-F06.png)

### F07
![img](../imgs/pimp-ind-F07.png)

### F08
![img](../imgs/pimp-ind-F08.png)

### F09
![img](../imgs/pimp-ind-F09.png)

### F10 
![img](../imgs/pimp-ind-F10.png)


### M01
![img](../imgs/pimp-ind-M01.png)

### M02
![img](../imgs/pimp-ind-M02.png)

### M03
![img](../imgs/pimp-ind-M03.png)

### M04
![img](../imgs/pimp-ind-M04.png)

### M05
![img](../imgs/pimp-ind-M05.png)

### M06
![img](../imgs/pimp-ind-M06.png)

### M07
![img](../imgs/pimp-ind-M07.png)

### M08
![img](../imgs/pimp-ind-M08.png)

### M09
![img](../imgs/pimp-ind-M09.png)

### M10
![img](../imgs/pimp-ind-M10.png)



## Summary

Overall, the post-interpolation (sleep) dataset looks promising for embarking on actual analysis. 

 - post-interpolation, we don't see the marked channel-specific artifact we saw in many pre-interpolation datasets

 - most remaining epoch-level artifact a) occurs during wake, and/or b) is outside the range of many sleep EEG analyses, and can therefore
 quite easily be handled by bandpass filtering, as above
 
 - even imposing epoch-level QC in which we remove an epoch if _at least one of 57 channels_ is an outlier, the post-imputation
  data appear to be of sufficiently good quality that we are able to retain a very substantial proportion of NREM epochs for analysis (i.e.
  comparing the epochs removed betweem the third and fourth rows above)
 

Clearly, this is not intended to be the last word in EEG artifact
detection and cleaning.  Particular analyses may require more focused 
approaches (e.g. to detect/remove cardiac or muscle contamination in the EEG, etc).

However, what we have at this point appears sufficient for getting started on
analysis based on the _clean_ (`c.lst`) project.  We can now [move on
to the analysis steps](../p5/index.md) of this walkthrough.
