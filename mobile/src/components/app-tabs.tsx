import { NativeTabs, Label, Icon } from 'expo-router/unstable-native-tabs';
import React from 'react';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      labelStyle={{ selected: { color: colors.text } }}>
      <NativeTabs.Trigger name="index">
        <Label>Sepetler</Label>
        <Icon src={require('@/assets/images/tabIcons/home.png')} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="catalog">
        <Label>Katalog</Label>
        <Icon src={require('@/assets/images/tabIcons/catalog.png')} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="explore">
        <Label>AI Analiz</Label>
        <Icon src={require('@/assets/images/tabIcons/explore.png')} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <Label>Profil</Label>
        <Icon src={require('@/assets/images/tabIcons/profile.png')} />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
