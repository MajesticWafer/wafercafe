#include <GPU.h>
#include <NDS.h>
#include <NDSCart.h>
#include <Config.h>
#include <SPI.h>
#include <emscripten.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#include <iostream>

extern "C" {

int main() {
  Config::DLDIEnable = 1;
  printf("NDS Init %d\n", NDS::Init());
  GPU::InitRenderer(0);
  GPU::RenderSettings r;
  r.Soft_Threaded = false;
  r.GL_ScaleFactor = 1;
  r.GL_BetterPolygons = false;
  GPU::SetRenderSettings(0, r);

  printf("wasm ready.\n");
  EM_ASM(wasmReady(););
}

void* getSymbol(int id) {
  if (id == 0) {
    return NDS::ARM7BIOS;
  }
  if (id == 1) {
    return NDS::ARM9BIOS;
  }
  if (id == 2) {
    return SPI_Firmware::Firmware;
  }
  if (id == 3) {
    return NDSCart::CartROM;
  }
  if (id == 4) {
    return GPU::Framebuffer[0][0];
  }
  if (id == 5) {
    return &(GPU::FrontBuffer);
  }
  return 0;
}

void reset() {
  NDS::Reset();
  // memset(NDSCart::CartROM, 0, sizeof(NDSCart::CartROM));
}

int loadROM(int romLen) {
  NDS::LoadROM((const u8*)NULL, romLen, "sram", true);
  return 0;
}

u32 runFrame() { return NDS::RunFrame(); }
}
