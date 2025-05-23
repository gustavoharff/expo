import nock from 'nock';

import { Log } from '../../../log';
import { checkPackagesCompatibility } from '../checkPackagesCompatibility';

jest.mock('../../../log');

describe(checkPackagesCompatibility, () => {
  it(`warns about one unsupported package`, async () => {
    nock('https://reactnative.directory')
      .post('/api/libraries/check')
      .reply(200, {
        'react-native-code-push': { newArchitecture: 'unsupported' },
      });

    await checkPackagesCompatibility(['react-native-code-push']);

    expect(Log.warn).toHaveBeenCalledTimes(1);
    expect(Log.warn).toHaveBeenCalledWith(
      expect.stringContaining('react-native-code-push does not support the New Architecture')
    );
  });

  it(`warns about multiple unsupported package`, async () => {
    nock('https://reactnative.directory')
      .post('/api/libraries/check')
      .reply(200, {
        '@react-native-community/blur': { newArchitecture: 'unsupported' },
        '@gorhom/bottom-sheet': { newArchitecture: 'unsupported' },
        'react-native-code-push': { newArchitecture: 'unsupported' },
      });

    await checkPackagesCompatibility([
      '@react-native-community/blur',
      '@gorhom/bottom-sheet',
      'react-native-code-push',
    ]);

    expect(Log.warn).toHaveBeenCalledTimes(1);
    expect(Log.warn).toHaveBeenCalledWith(
      expect.stringContaining(
        '@react-native-community/blur, @gorhom/bottom-sheet and react-native-code-push do not support the New Architecture'
      )
    );
  });

  it(`does not warn about supported or unknown package`, async () => {
    nock('https://reactnative.directory')
      .post('/api/libraries/check')
      .reply(200, {
        'expo-image': { newArchitecture: 'supported' },
        'expo-image-picker': { newArchitecture: undefined },
      });

    await checkPackagesCompatibility(['expo-image', '@expo-google-fonts/inter']);

    expect(Log.warn).toHaveBeenCalledTimes(0);
  });

  it(`does not fetch or warn when installing ignored packages`, async () => {
    let wasCalled = false;

    nock('https://reactnative.directory')
      .post('/api/libraries/check')
      .reply(200, () => {
        wasCalled = true;
        return {};
      });

    await checkPackagesCompatibility([
      '@expo-google-fonts/inter',
      '@expo/metro-runtime',
      '@expo/styleguide',
    ]);

    expect(wasCalled).toBe(false);
    expect(Log.warn).toHaveBeenCalledTimes(0);
  });
});
