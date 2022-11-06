hash=`echo "I <3 IPFS -$(whoami)" | ipfs add -q`
curl "https://ipfs.io/ipfs/$hash"

> I <3 IPFS -jade
