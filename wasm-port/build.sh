SRC="main.cpp Platform.cpp"
EXPORTED_FUNCTIONS='["_main","_getSymbol","_loadROM","_reset","_runFrame"]'

emcc -O3 -s EXPORTED_FUNCTIONS=$EXPORTED_FUNCTIONS -s TOTAL_MEMORY=268435456  ../build/src/libcore.a $SRC -I ../src
