# Scaled PSC

### Scaled PSC

Assume pre-existing file `n106/psd.sex.weights` that 

```
head n106/psd.sex.weights 
```
```
Fp1	0.5	PSD	0.186028134859083
Fp1	0.75	PSD	0.194165451187633
Fp1	1	PSD	0.204386443241966
Fp1	1.25	PSD	0.290743233944309
Fp1	1.5	PSD	0.295815571248232
Fp1	1.75	PSD	0.31382524115499
Fp1	2	PSD	0.297659665728476
Fp1	2.25	PSD	0.248089637120463
Fp1	2.5	PSD	0.185074360791828
Fp1	2.75	PSD	0.1089135786044
...
```

```
luna --psc -o n106/psc-scaled-psd-n2.db \
     --options spectra=n106/psd.n2 v=PSD nc=10 norm \
               scale=n106/psd.sex.weights \
               proj=n106/psd.n2.scaled.proj 
```
```
  reading spectra from n106/psd.n2
  converting input spectra to a matrix
  found 106 rows (observations) and 4503 columns (features)
  finished making regular data matrix on 106 observations
  read 4503 weights from n106/psd.sex.weights (including double-entering any 2-channel weights)
  after outlier removal, 106 observations remaining
  standardizing data matrix
  scales found for 4503 of 4503 variables
  about to perform SVD...
  done... now writing output
  writing projection to n106/psd.n2.scaled.proj
```


Now project this solution into N=20:

```
luna c.lst  -o out/psc-psd-n2-scaled-proj106.db \
  -s ' CACHE cache=c1 record=PSD,PSD,F,CH uppercase-keys
       MASK ifnot=N2 & RE preserve-cache
       CHEP-MASK ep-th=3,3
       CHEP epochs & RE preserve-cache
       MASK random=50 & RE preserve-cache
       PSD sig=${eeg} dB spectrum min=0.5 max=20
       PSC proj=n106/psd.n2.scaled.proj cache=c1 norm '
```



### Sex differences

(test for sex differences)

          N=106 solution       Projection                     N=20 solution
 - N=20   .                    .                              out/psc-psd-n2.db
 - N=106  n106/psc-psd-n2.db   n106/psd.n2.proj               out/psc-psd-n2-proj106.db
 - scaled n106/psc-psd-n2.db   n106/psd.n2.scaled.proj        out/psc-psd-n2-scaled-proj106.db


destrat out/psc-psd-n2.db +PSC -r PSC > res/psc.psd
destrat out/psc-psd-n2-proj106.db +PSC -r PSC > res/psc.psd.n106
destrat out/psc-psd-n2-scaled-proj106.db +PSC -r PSC > res/psc.psd.scaled.n106

R
library(luna)
k1 <- ldb( "out/psc-psd-n2.db" )
k2 <- ldb( "out/psc-psd-n2-proj106.db" )
k3 <- ldb( "out/psc-psd-n2-scaled-proj106.db" )


d1 <- k1$PSC$PSC
d2 <- k2$PSC$PSC
d3 <- k3$PSC$PSC

d1$MALE <- grepl( "M" , d1$ID )
d2$MALE <- grepl( "M" , d2$ID )
d3$MALE <- grepl( "M" , d3$ID )

for (i in 1:10 ) {

tt1 <- t.test( U ~ MALE , data = d1 , subset = PSC == i )
tt2 <- t.test( U ~ MALE , data = d2 , subset = PSC == i )
tt3 <- t.test( U ~ MALE , data = d3 , subset = PSC == i )

cat( i , tt1$p.value , tt2$p.value , tt3$p.value , sep="\t" , "\n" )
}



## PSI

<!--

          N=106 solution       Projection                     N=20 solution
 - N=20   .                    .                              out/psc-psd-n2.db
 - N=106  n106/psc-psd-n2.db   n106/psd.n2.proj               out/psc-psd-n2-proj106.db
 - scaled n106/psc-psd-n2.db   n106/psd.n2.scaled.proj        out/psc-psd-n2-scaled-proj106.db


run all

# original   out/psc-psi-n2.db

luna --psc -o out/psc-psi-n2.db \
     --options spectra=res/psi2.n2 nc=10 v=PSI 

# N=106
#  -- n106/psi2.n2 -> out/psc-psi-n2.db -> (proj) ->  n106/proj-psi-n2.db

luna --psc -o n106/psc-psi-n2.db \
     --options spectra=n106/psi2.n2 v=PSI nc=10 proj=n106/psi2.n2.proj

luna c.lst  -o out/psc-psi-n2-proj106.db \
  -s ' CACHE cache=c1 record=PSI,PSI,F,CH1,CH2 uppercase-keys
       MASK ifnot=N2 & RE preserve-cache
       CHEP-MASK ep-th=3,3
       CHEP epochs & RE preserve-cache
       MASK random=50 & RE preserve-cache
       PSI sig=${eeg} f-lwr=3 f-upr=19 r=2 w=4
       PSC proj=n106/psi2.n2.proj cache=c1 signed-pairwise norm '

# N=106, scaled

luna --psc -o n106/psc-psi-n2.db \
     --options spectra=n106/psi2.n2 v=PSI nc=10 proj=n106/psi2.n2.scaled.proj scale=n106/psi.sex.weights

luna c.lst  -o out/psc-psi-n2-scaled-proj106.db \
  -s ' CACHE cache=c1 record=PSI,PSI,F,CH1,CH2 uppercase-keys
       MASK ifnot=N2 & RE preserve-cache
       CHEP-MASK ep-th=3,3
       CHEP epochs & RE preserve-cache
       MASK random=50 & RE preserve-cache
       PSI sig=${eeg} f-lwr=3 f-upr=19 r=2 w=4
       PSC proj=n106/psi2.n2.scaled.proj cache=c1 signed-pairwise norm '

# save all
destrat out/psc-psi-n2.db +PSC -r PSC > res/psc.psi
destrat out/psc-psi-n2-proj106.db +PSC -r PSC > res/psc.psi.n106
destrat out/psc-psi-n2-scaled-proj106.db +PSC -r PSC > res/psc.psi.scaled.n106


# compare all

R
library(luna)
k1 <- ldb( "out/psc-psi-n2.db" )
k2 <- ldb( "out/psc-psi-n2-proj106.db" )
k3 <- ldb( "out/psc-psi-n2-scaled-proj106.db" )

d1 <- k1$PSC$PSC
d2 <- k2$PSC$PSC
d3 <- k3$PSC$PSC

d1$MALE <- grepl( "M" , d1$ID )
d2$MALE <- grepl( "M" , d2$ID )
d3$MALE <- grepl( "M" , d3$ID )

for (i in 1:10 ) {
 tt1 <- t.test( U ~ MALE , data = d1 , subset = PSC == i )
 tt2 <- t.test( U ~ MALE , data = d2 , subset = PSC == i )
 tt3 <- t.test( U ~ MALE , data = d3 , subset = PSC == i )
 cat( i , tt1$p.value , tt2$p.value , tt3$p.value , sep="\t" , "\n" )
}


-->


