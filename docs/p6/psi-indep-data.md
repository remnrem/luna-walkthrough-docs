# 

## Independent datasets

### GRINS106



### CHAT

Application to a different (pediatric) dataset, with limited montage

<!--

# on ERIS (grins/luna/anal/)
cd /data/purcell/projects/grins/luna/anal/
luna chat.lst 1 -o out.db < cmd/chat-psi.txt

/data/nsrr/bin/dev-runner.sh 10 chat.lst chat-param cmd/chat-psi.txt o out/chat-psi
grep error out/chat-psi.batch000*err

destrat out/chat-psi*db +PSI -r F CH1 CH2 stg > res/chat.psi.txt

# local
eriscp eristwo:/data/purcell/projects/grins/luna/anal/res/chat.psi.txt psc/
eriscp eristwo:/data/purcell/projects/spectral-slope/files/demo.RData psc/demo.RData

R
d <- read.table( "psc/chat.psi.txt",header=T,stringsAsFactors=F)
source("arconn.R")
load("psc/demo.RData")
m$ID <- gsub( "chat_" , "chat-baseline-" , m$ID )
m <- m[ m$group == "BSL" , ]

# prep 'd'
d <- d[ , c("ID","CH1","CH2","F","stg","PSI" ) ]

d <- rbind ( d ,
             data.frame( ID = d$ID , CH1 = d$CH2 , CH2 = d$CH1 , F = d$F , stg = d$stg , PSI = - d$PSI ) )

k <- merge( d , m[ , c("ID" , "age" , "race" , "gender" , "bmi" ) ]   , by="ID" )
dim(k)


> table( k$CH1 , k$CH2 )

       C3   C4   F3   F4   O1   O2
  C3    0 8136 8136 8136 8136 8136
  C4 8136    0 8136 8136 8136 8136
  F3 8136 8136    0 8136 8136 8136
  F4 8136 8136 8136    0 8136 8136
  O1 8136 8136 8136 8136    0 8136
  O2 8136 8136 8136 8136 8136    0


# get means
a <- aggregate( k[,c("PSI")] ,
                by = list( F=k$F, CH1=k$CH1, CH2=k$CH2 , stg = k$stg ) ,
                FUN = mean , na.rm=T)

# means : N2 vs R

zlim = range( a$x )
par(mfrow=c(2,9),mar=c(0,0,0,0) )
for (f in unique( a$F ) ) arconn( a$CH1 , a$CH2 , a$x , flt = a$stg == "N2" & a$F == f , dst = 1 , directional=T , zr = zlim )
for (f in unique( a$F ) ) arconn( a$CH1 , a$CH2 , a$x , flt = a$stg == "R" & a$F == f , dst = 1 , directional=T , zr = zlim )

# only strong links (Z>1)   YES!
zlim = range( a$x )
par(mfrow=c(2,9),mar=c(0,0,0,0) )
for (f in unique( a$F ) ) arconn( a$CH1 , a$CH2 , a$x , flt = a$stg == "N2" & a$F == f & a$x > 1 , dst = 1 , directional=T , zr = zlim )
for (f in unique( a$F ) ) arconn( a$CH1 , a$CH2 , a$x , flt = a$stg == "R" & a$F == f & a$x > 1 , dst = 1 , directional=T , zr = zlim )

# same plot as vig: (paired diffs?
kk <- k[ k$CH1 == "C4" & k$CH2 == "F4" & k$F == 5 , ]

> t.test( PSI ~ stg , data = kk )

data:  PSI by stg
t = -9.2886, df = 797.87, p-value < 2.2e-16
mean in group N2  mean in group R
        1.677938         3.380882




# sex diffs

km <- k[ k$gender ==1 , ]
kf <- k[ k$gender ==2 , ]

a <- aggregate( k[,c("PSI")] ,
                by = list( F=k$F, CH1=k$CH1, CH2=k$CH2 , stg = k$stg ) ,
                FUN = mean , na.rm=T)

# do stats

res <- numeric(0)
for ( stg  in c("N2","R"))
 for (f in unique(d$F)) {
 xx <- k[ k$F == f & k$stg == stg  , ]
 for (ch1 in unique(k$CH1))
 for (ch2 in unique(k$CH2)) {
  if ( ch1 != ch2 ) {
   yy <- xx[ xx$CH1 == ch1 & xx$CH2 == ch2 , ]
    tt1 <- t.test( PSI ~ gender , data = yy )
    if (  tt1$p.value < 0.001 )
      cat(stg, f, ch1, ch2, tt1$estimate, tt1$p.value, "\n")
    res <- rbind( res ,
                c(stg, f, ch1, ch2,
                tt1$estimate, tt1$p.value ))
}}
}

res <- data.frame( res )
names(res) <- c("STG","F","CH1","CH2","FEMALE","MALE","P"  )
for (i in c(2,5:7)) res[,i] <- as.numeric( res[,i] )
res$Z <- sign( res$MALE - res$FEMALE ) * -log10( res$P )

# viz sex diffs

f = 11
stg = "N2"

zlim = range( res$Z )
par(mfcol=c(1,3), mar=c(0,0,1,0))

arconn(res$CH1, res$CH2, z=res$MALE, flt= res$F == f & res$MALE > 1 & res$STG == stg ,  dst=1, lwd1=0.2, lwd2=1)
arconn(res$CH1, res$CH2, z=res$FEMALE, flt= res$F == f & res$FEMALE > 1 & res$STG == stg ,   dst=1, lwd1=0.2, lwd2=1)


zlim = range( res$Z )
par(mfrow=c(2,9),mar=c(0,0,0,0) )
for (f in unique( a$F ) ) arconn(res$CH1, res$CH2, z=res$Z , flt= res$F == f & res$STG == "N2" & res$Z>2, directional=T , dst=1, lwd1=0.2, lwd2=1, zr=zlim)
for (f in unique( a$F ) ) arconn(res$CH1, res$CH2, z=res$Z , flt= res$F == f & res$STG == "R" & res$Z>2, directional=T , dst=1, lwd1=0.2, lwd2=1, zr=zlim)



arconn(res$CH1, res$CH2, z=res$NRF, flt= res$F == 11 & res$NRF > 2,
       zr=zlim, title="F (11 Hz)" , dst=1, lwd1=0.2, lwd2=1)

arconn(res$CH1, res$CH2, z=res$NRF, z2=res$NRZ, flt= res$F == 11 & abs( res$NRZ ) > 2 ,
       zr=zlim , title = "M vs F (Z)" , dst = 1 , lwd1=0.2, lwd2=1)

-->

