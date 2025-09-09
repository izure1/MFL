import type { ForgeConfig } from '@electron-forge/shared-types';
import { join } from 'node:path'
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { VitePlugin } from '@electron-forge/plugin-vite';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';
import * as NodeFSExtra from 'fs-extra';

const config: ForgeConfig = {
  packagerConfig: {
    asar: {
      unpack: [
        '**/@img/**/*',
        '**/sharp/**/*',
        "**/node-win-pcap/**/*",
        '**/node-screenshots/**/*',
        '**/node-screenshots-win32-x64-msvc/**/*',
      ].join(',')
    },
    afterCopy: [
      async (buildPath, electronVersion, platform, arch, callback) => {
        // Copy optional dependencies
        const optionalDependencies = [
          '@img',
          'node-screenshots-win32-x64-msvc',
          'node-win-pcap',
        ]
        const tasks = optionalDependencies.map((moduleName) => {
          const modulePath = `node_modules/${moduleName}`
          return NodeFSExtra.copy(
            modulePath,
            join(buildPath, modulePath),
          )
        })
        Promise.all(tasks)
          .then(() => callback())
      }
    ],
    icon: 'src/renderer/assets/img/icon.png',
    win32metadata: {
      'CompanyName': 'org.izure',
      'ProductName': 'mfl',
      'requested-execution-level': 'requireAdministrator'
    },
    extraResource: [
      './resources/bin',
      './resources/audio',
    ]
  },
  rebuildConfig: {},
  hooks: {},
  makers: [
    new MakerSquirrel({
      name: 'MFL',
      authors: 'izure',
      iconUrl: 'https://mfl.izure.org/favicon.ico',
      setupIcon: join('./src/renderer/assets/img/icon.ico'),
    }),
    new MakerZIP({}, ['darwin']),
    new MakerRpm({}),
    new MakerDeb({})
  ],
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'izure1',
          name: 'MFL'
        },
        prerelease: false
      }
    }
  ],
  plugins: [
    new VitePlugin({
      // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
      // If you are familiar with Vite configuration, it will look really familiar.
      build: [
        {
          // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
          entry: 'src/main.ts',
          config: 'vite.main.config.ts',
        },
        {
          entry: 'src/preload.ts',
          config: 'vite.preload.config.ts',
        },
        // {
        //   entry: 'src/worker/auctionFetch.worker.ts',
        //   config: 'vite.worker.config.ts'
        // },
        {
          entry: 'src/worker/auctionFilter.worker.ts',
          config: 'vite.worker.config.ts'
        },
        {
          entry: 'src/worker/loggingCapture.worker.ts',
          config: 'vite.worker.config.ts'
        },
        {
          entry: 'src/worker/chatCapture.worker.ts',
          config: 'vite.worker.config.ts'
        },
      ],
      renderer: [
        {
          name: 'main_window',
          config: 'vite.renderer.config.ts',
        },
        {
          name: 'overlay_window',
          config: 'vite.renderer.config.ts',
        },
      ],
    }),
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {}
    },
  ],
};

export default config;
