import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/auth-context';
import { Colors } from '../constants/theme';
import { useColorScheme } from 'react-native';

const { width } = Dimensions.get('window');

export const AuthScreen: React.FC = () => {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const { login, register, error, clearError } = useAuth();
  
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  const handleToggleMode = () => {
    setIsRegister(!isRegister);
    clearError();
  };

  const handleSubmit = async () => {
    if (!username.trim() || !password.trim()) {
      alert('Lütfen kullanıcı adı ve şifre girin.');
      return;
    }

    setLoading(true);
    let success = false;

    if (isRegister) {
      success = await register({
        username: username.trim(),
        password: password.trim(),
        name: name.trim() || 'Yeni Kullanıcı',
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
      });
    } else {
      success = await login(username.trim(), password.trim());
    }

    setLoading(false);
    if (success) {
      console.log('Authentication successful!');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Header Branding */}
        <View style={styles.brandContainer}>
          <View style={styles.iconContainer}>
            <Ionicons name="basket" size={48} color="#6b21a8" />
          </View>
          <Text style={[styles.brandText, { color: colors.text }]}>TrendSepetiX</Text>
          <Text style={[styles.subtitleText, { color: colors.textSecondary }]}>
            {isRegister ? 'Yeni hesap oluşturun' : 'Lütfen giriş yapın'}
          </Text>
        </View>

        {/* Auth Mode Toggle Tabs */}
        <View style={[styles.tabContainer, { backgroundColor: colors.backgroundElement }]}>
          <TouchableOpacity
            style={[styles.tabButton, !isRegister && styles.activeTabButton]}
            onPress={() => isRegister && handleToggleMode()}
          >
            <Text style={[styles.tabText, !isRegister ? styles.activeTabText : { color: colors.textSecondary }]}>
              Giriş Yap
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, isRegister && styles.activeTabButton]}
            onPress={() => !isRegister && handleToggleMode()}
          >
            <Text style={[styles.tabText, isRegister ? styles.activeTabText : { color: colors.textSecondary }]}>
              Hesap Oluştur
            </Text>
          </TouchableOpacity>
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={20} color="#dc2626" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Input Fields */}
        <View style={styles.formContainer}>
          <View style={[styles.inputWrapper, { backgroundColor: colors.backgroundElement }]}>
            <Ionicons name="person-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Kullanıcı Adı"
              placeholderTextColor={colors.textSecondary}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={[styles.inputWrapper, { backgroundColor: colors.backgroundElement }]}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Şifre"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {isRegister && (
            <>
              <View style={[styles.inputWrapper, { backgroundColor: colors.backgroundElement }]}>
                <Ionicons name="card-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Ad Soyad"
                  placeholderTextColor={colors.textSecondary}
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={[styles.inputWrapper, { backgroundColor: colors.backgroundElement }]}>
                <Ionicons name="mail-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="E-posta"
                  placeholderTextColor={colors.textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={[styles.inputWrapper, { backgroundColor: colors.backgroundElement }]}>
                <Ionicons name="call-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Telefon Numarası"
                  placeholderTextColor={colors.textSecondary}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={[styles.inputWrapper, styles.textAreaWrapper, { backgroundColor: colors.backgroundElement }]}>
                <Ionicons name="map-outline" size={20} color={colors.textSecondary} style={[styles.inputIcon, { marginTop: 10 }]} />
                <TextInput
                  style={[styles.input, styles.textArea, { color: colors.text }]}
                  placeholder="Teslimat Adresi"
                  placeholderTextColor={colors.textSecondary}
                  value={address}
                  onChangeText={setAddress}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </>
          )}

          {/* Action Button */}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.submitButtonText}>
                  {isRegister ? 'Hesap Oluştur' : 'Giriş Yap'}
                </Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 8 }} />
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 60 : 40,
    paddingBottom: 40,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: 'rgba(107, 33, 168, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  brandText: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subtitleText: {
    fontSize: 15,
    marginTop: 6,
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTabButton: {
    backgroundColor: '#6b21a8',
    shadowColor: '#6b21a8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
  },
  activeTabText: {
    color: '#ffffff',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(220, 38, 38, 0.08)',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.2)',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  formContainer: {
    width: '100%',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 52,
  },
  textAreaWrapper: {
    height: 90,
    alignItems: 'flex-start',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    height: '100%',
  },
  textArea: {
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  submitButton: {
    backgroundColor: '#6b21a8',
    borderRadius: 12,
    height: 52,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#6b21a8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
