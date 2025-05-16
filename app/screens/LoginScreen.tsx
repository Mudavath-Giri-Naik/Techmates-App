// app/screens/LoginScreen.tsx
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types'; // Adjust the path as necessary
import Icon from 'react-native-vector-icons/Feather';
import { supabase } from '../../utils/supabase';

// --- Configuration ---
const ALLOWED_EMAIL_DOMAINS = ['@mvgrce.edu.in','@gmail.com']; // Keep your domain restriction
const PRIMARY_COLOR = '#0052FF';
const LIGHT_BLUE_ACCENT = '#65a7fc';
const TEXT_COLOR_DARK = '#1A202C';
const TEXT_COLOR_MEDIUM = '#4A5568';
const TEXT_COLOR_LIGHT = '#A0AEC0';
const INPUT_BORDER_COLOR = '#E2E8F0';
const ERROR_COLOR = '#E53E3E';
const WHITE_COLOR = '#FFFFFF';
const BUBBLE_COLOR_1 = 'rgba(0, 196, 255, 0.15)';
const BUBBLE_COLOR_2 = 'rgba(0, 82, 255, 0.1)';

// --- Types ---
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen = () => {
  const navigation = useNavigation<NavigationProp>(); // Still useful for other potential navigation (e.g., Forgot Password)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const validateInputs = useCallback(() => {
    let isValid = true;
    setEmailError(null);
    setPasswordError(null);
    setGeneralError(null);

    if (!email) {
      setEmailError('Email address is required.');
      isValid = false;
    } else {
      const isValidDomain = ALLOWED_EMAIL_DOMAINS.some(domain => email.endsWith(domain));
      if (!isValidDomain) {
          const exampleDomain = ALLOWED_EMAIL_DOMAINS.includes('@mvgrce.edu.in') ? 'mvgrce.edu.in' : ALLOWED_EMAIL_DOMAINS[0]?.substring(1) || 'allowed domain';
          setEmailError(`Only emails from allowed domains are permitted (e.g., *@${exampleDomain})`);
          isValid = false;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          setEmailError('Please enter a valid email address.');
          isValid = false;
      }
    }

    if (!password) {
      setPasswordError('Password is required.');
      isValid = false;
    } else if (password.length < 6) {
       setPasswordError('Password must be at least 6 characters long.');
       isValid = false;
    }

    return isValid;
  }, [email, password]);

  const handleAuthError = (error: any) => {
    let friendlyMessage = 'An unexpected error occurred. Please try again.';
    setEmailError(null);
    setPasswordError(null);

    if (error.message.includes('Invalid login credentials')) {
      setGeneralError('Incorrect email or password. Please try again.');
    } else if (error.message.includes('Email not confirmed')) {
      setGeneralError('Please verify your email address before signing in.');
    } else if (error.message.includes('User already registered')) {
      setEmailError('This email address is already registered. Try signing in or use a different email.');
    } else {
      console.error("Auth Error:", error);
      setGeneralError(friendlyMessage);
    }
  };

  const handleAuthentication = async () => {
    if (!validateInputs()) return;
    setLoading(true);
    setGeneralError(null);
    try {
      if (isLoginMode) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        console.log('Signed in successfully!');
        navigation.replace('MainApp', { screen: 'HomeTab' });
      } else {
        // Sign up
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: email.split('@')[0], // Use email username as initial full_name
              email_domain: email.split('@')[1],
            },
          },
        });

        if (signUpError) throw signUpError;

        if (authData.user) {
          // Create profile
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              {
                id: authData.user.id,
                email: email,
                full_name: email.split('@')[0], // Use email username as initial full_name
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
            ]);

          if (profileError) {
            console.error('Error creating profile:', profileError);
            throw new Error('Failed to create user profile');
          }
        }

        console.log('User account created & signed in!');
        navigation.replace('MainApp', { screen: 'HomeTab' });
      }
    } catch (error: any) {
      console.error("Authentication Error:", error);
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setEmail('');
    setPassword('');
    setEmailError(null);
    setPasswordError(null);
    setGeneralError(null);
    setIsPasswordVisible(false);
  };

  const togglePasswordVisibility = () => setIsPasswordVisible(!isPasswordVisible);

  return (
    <View style={styles.rootContainer}>
       <StatusBar barStyle="dark-content" backgroundColor={WHITE_COLOR} />

        <View style={[styles.backgroundBubbleBase, styles.bubble1]} />
        <View style={[styles.backgroundBubbleBase, styles.bubble2]} />
        <View style={[styles.backgroundBubbleBase, styles.bubble3]} />
        <View style={[styles.backgroundBubbleBase, styles.bubble4]} />

        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardAvoidingContainer}
            >
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.contentContainer}>
                    <Text style={styles.title}>
                    {isLoginMode ? 'Sign in' : 'Create Account'}
                    </Text>
                    <Text style={styles.subtitle}>
                    {isLoginMode
                        ? `Welcome back! Please enter your details.`
                        : 'Enter your email and password to sign up.'}
                    </Text>

                    {generalError && (
                    <Text style={styles.generalErrorText}>{generalError}</Text>
                    )}

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            placeholder="Enter your email"
                            value={email}
                            onChangeText={(text) => {
                            setEmail(text.trim());
                            if (emailError) setEmailError(null);
                            if (generalError) setGeneralError(null);
                            }}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            style={[styles.input, emailError ? styles.inputError : null]}
                            placeholderTextColor={TEXT_COLOR_LIGHT}
                            textContentType="emailAddress"
                        />
                        {emailError && <Text style={styles.errorText}>{emailError}</Text>}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password</Text>
                        <View style={[styles.passwordContainer, passwordError ? styles.inputError : null]}>
                            <TextInput
                            placeholder="Enter your password"
                            value={password}
                            onChangeText={(text) => {
                                setPassword(text);
                                if (passwordError) setPasswordError(null);
                                if (generalError) setGeneralError(null);
                            }}
                            secureTextEntry={!isPasswordVisible}
                            style={styles.inputPassword}
                            placeholderTextColor={TEXT_COLOR_LIGHT}
                            textContentType={isLoginMode ? "password" : "newPassword"}
                            />
                            <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon}>
                            <Icon name={isPasswordVisible ? 'eye-off' : 'eye'} size={20} color={TEXT_COLOR_MEDIUM} />
                            </TouchableOpacity>
                        </View>
                        {passwordError && <Text style={styles.errorText}>{passwordError}</Text>}
                    </View>

                    {isLoginMode && (
                        <TouchableOpacity style={styles.forgotPasswordButton} onPress={() => {
                            // TODO: Add forgot password logic
                            // Example: navigation.navigate('ForgotPassword');
                            // (You'd need to add 'ForgotPassword' to RootStackParamList)
                            alert('Forgot Password functionality to be implemented.');
                        }}>
                            <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleAuthentication}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color={WHITE_COLOR} />
                        ) : (
                            <Text style={styles.buttonText}>
                            {isLoginMode ? 'SIGN IN' : 'SIGN UP'}
                            </Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={toggleMode} style={styles.toggleButton}>
                        <Text style={styles.toggleButtonText}>
                            {isLoginMode ? "Don't have an account? " : 'Already have an account? '}
                            <Text style={styles.toggleButtonLinkText}>
                                {isLoginMode ? 'Sign Up' : 'Sign In'}
                            </Text>
                        </Text>
                    </TouchableOpacity>

                </View>
            </ScrollView>
        </KeyboardAvoidingView>

        <View style={styles.bottomCurveContainer}>
             <View style={styles.bottomCurve} />
        </View>
    </View>
  );
};

export default LoginScreen;

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: WHITE_COLOR,
  },
  keyboardAvoidingContainer: {
    flex: 1,
    zIndex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingBottom: 150,
    paddingTop: 40,
    zIndex: 1,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: TEXT_COLOR_DARK,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: TEXT_COLOR_MEDIUM,
    textAlign: 'center',
    marginBottom: 40,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: TEXT_COLOR_MEDIUM,
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: WHITE_COLOR,
    borderWidth: 1,
    borderColor: INPUT_BORDER_COLOR,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: TEXT_COLOR_DARK,
    height: 52,
  },
   passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WHITE_COLOR,
    borderWidth: 1,
    borderColor: INPUT_BORDER_COLOR,
    borderRadius: 12,
    height: 52,
  },
  inputPassword: {
      flex: 1,
      paddingLeft: 16,
      paddingRight: 10,
      paddingVertical: 14,
      fontSize: 16,
      color: TEXT_COLOR_DARK,
      height: '100%',
  },
  eyeIcon: {
    paddingHorizontal: 16,
    height: '100%',
    justifyContent: 'center',
  },
  inputError: {
    borderColor: ERROR_COLOR,
  },
  errorText: {
    color: ERROR_COLOR,
    fontSize: 13,
    marginTop: 6,
    marginLeft: 4,
  },
  generalErrorText: {
    color: ERROR_COLOR,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 15,
    paddingHorizontal: 10,
  },
    forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 25,
    marginTop: -10,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: PRIMARY_COLOR,
    fontWeight: '500',
  },
  button: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 15,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    minHeight: 52,
    shadowColor: PRIMARY_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: '#A0AEC0',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: WHITE_COLOR,
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  toggleButton: {
    marginTop: 30,
    alignItems: 'center',
  },
  toggleButtonText: {
    color: TEXT_COLOR_MEDIUM,
    fontSize: 15,
    textAlign: 'center',
  },
   toggleButtonLinkText: {
    color: PRIMARY_COLOR,
    fontWeight: '600',
  },
  bottomCurveContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: windowHeight * 0.1,
    overflow: 'hidden',
    zIndex: 0,
  },
  bottomCurve: {
    flex: 1,
    backgroundColor: LIGHT_BLUE_ACCENT,
    borderTopLeftRadius: windowHeight * 0.5,
    borderTopRightRadius: windowHeight * 0.5,
    transform: [{ translateY: windowHeight * 0.05 }]
  },
  backgroundBubbleBase: {
      position: 'absolute',
      zIndex: 0,
  },
  bubble1: {
      width: windowWidth * 0.6,
      height: windowWidth * 0.6,
      borderRadius: windowWidth * 0.3,
      backgroundColor: BUBBLE_COLOR_1,
      top: -windowWidth * 0.2,
      left: -windowWidth * 0.25,
  },
  bubble2: {
      width: windowWidth * 0.4,
      height: windowWidth * 0.4,
      borderRadius: windowWidth * 0.2,
      backgroundColor: BUBBLE_COLOR_2,
      top: windowHeight * 0.2,
      right: -windowWidth * 0.15,
  },
  bubble3: {
      width: windowWidth * 0.3,
      height: windowWidth * 0.3,
      borderRadius: windowWidth * 0.15,
      backgroundColor: BUBBLE_COLOR_1,
      bottom: windowHeight * 0.15,
      left: windowWidth * 0.05,
  },
   bubble4: {
      width: windowWidth * 0.5,
      height: windowWidth * 0.5,
      borderRadius: windowWidth * 0.25,
      backgroundColor: BUBBLE_COLOR_2,
      bottom: -windowWidth * 0.1,
      right: -windowWidth * 0.1,
  },
});