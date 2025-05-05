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
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { FIREBASE_AUTH } from '../../firebaseConfig'; // Adjust path if needed
import Icon from 'react-native-vector-icons/Feather';

// --- Configuration ---
const ALLOWED_EMAIL_DOMAINS = ['@mvgrce.edu.in'];
const PRIMARY_COLOR = '#0052FF';
const LIGHT_BLUE_ACCENT = '#65a7fc'; // Curve color
const TEXT_COLOR_DARK = '#1A202C';
const TEXT_COLOR_MEDIUM = '#4A5568';
const TEXT_COLOR_LIGHT = '#A0AEC0';
const INPUT_BORDER_COLOR = '#E2E8F0';
const ERROR_COLOR = '#E53E3E';
const WHITE_COLOR = '#FFFFFF';
// Background Bubble Colors (with transparency)
const BUBBLE_COLOR_1 = 'rgba(0, 196, 255, 0.15)'; // Lighter accent blue, semi-transparent
const BUBBLE_COLOR_2 = 'rgba(0, 82, 255, 0.1)'; // Lighter primary blue, semi-transparent

// --- Types ---
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // Error States
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const auth = FIREBASE_AUTH;

  // --- Input Validation ---
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

   // --- Error Handling ---
   const handleAuthError = (error: any) => {
    let friendlyMessage = 'An unexpected error occurred. Please try again.';
    const errorCode = error?.code;
    setEmailError(null);
    setPasswordError(null);

    switch (errorCode) {
        case 'auth/invalid-email':
            setEmailError('Please enter a valid email address format.');
            break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
            setGeneralError('Incorrect email or password. Please try again.');
            break;
        case 'auth/user-disabled':
            setGeneralError('This user account has been disabled.');
            break;
        case 'auth/email-already-in-use':
            setGeneralError(null);
            setEmailError('This email address is already registered. Try signing in or use a different email.');
            break;
        case 'auth/weak-password':
            setGeneralError(null);
            setPasswordError('Password is too weak. Please use at least 6 characters.');
            break;
        case 'auth/too-many-requests':
            setGeneralError('Access temporarily disabled due to too many attempts. Please try again later.');
            break;
        default:
            console.error("Unhandled Auth Error Code:", errorCode, "Message:", error?.message);
            setGeneralError(friendlyMessage);
      }
    };

  // --- Firebase Authentication ---
  const handleAuthentication = async () => {
    if (!validateInputs()) return;
    setLoading(true);
    setGeneralError(null);
    try {
      if (isLoginMode) {
        await signInWithEmailAndPassword(auth, email, password);
        console.log('Signed in successfully!');
        navigation.replace('Home');
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        console.log('User account created & signed in!');
        navigation.replace('Home');
      }
    } catch (error: any) {
      console.error("Authentication Error:", error);
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  // --- UI Toggles ---
  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setEmail(''); setPassword('');
    setEmailError(null); setPasswordError(null); setGeneralError(null);
    setIsPasswordVisible(false);
  };

  const togglePasswordVisibility = () => setIsPasswordVisible(!isPasswordVisible);

  // --- Render ---
  return (
    // Root container holds everything, including background elements
    <View style={styles.rootContainer}>
       <StatusBar barStyle="dark-content" backgroundColor={WHITE_COLOR} />

        {/* Background Decorative Bubbles */}
        <View style={[styles.backgroundBubbleBase, styles.bubble1]} />
        <View style={[styles.backgroundBubbleBase, styles.bubble2]} />
        <View style={[styles.backgroundBubbleBase, styles.bubble3]} />
        <View style={[styles.backgroundBubbleBase, styles.bubble4]} />

        {/* Keyboard avoiding view wraps the scrollable content */}
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardAvoidingContainer}
            >
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps="handled"
            >
                {/* Content container holds the inputs/buttons */}
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

                    {/* Email Input Group */}
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

                    {/* Password Input Group */}
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
                        <TouchableOpacity style={styles.forgotPasswordButton} onPress={() => {/* TODO: Add forgot password logic */}}>
                            <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
                        </TouchableOpacity>
                    )}

                    {/* Action Button */}
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

                    {/* Toggle Mode Link */}
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

        {/* Bottom Curve Decoration (ensure it's after bubbles in JSX for layering if needed, though zIndex handles it) */}
        <View style={styles.bottomCurveContainer}>
             <View style={styles.bottomCurve} />
        </View>
    </View>
  );
};

export default LoginScreen;

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;

// --- Styles ---
const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: WHITE_COLOR, // Base background
  },
  keyboardAvoidingContainer: {
    flex: 1,
    zIndex: 1, // Ensure KAV is above background elements but below potential modals
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingBottom: 150, // Space above the curve
    paddingTop: 40,
    zIndex: 1, // Content must be above background bubbles and curve
    backgroundColor: 'transparent', // Ensure content area doesn't block bubbles with its own bg
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
    backgroundColor: WHITE_COLOR, // Input field background
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
      paddingLeft: 16, // Keep padding consistent
      paddingRight: 10, // Reduce right padding a bit
      paddingVertical: 14, // Use vertical padding
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

  // --- Bottom Curve Styles ---
  bottomCurveContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: windowHeight * 0.1,
    overflow: 'hidden',
    zIndex: 0, // Behind content, above base background
  },
  bottomCurve: {
    flex: 1,
    backgroundColor: LIGHT_BLUE_ACCENT,
    borderTopLeftRadius: windowHeight * 0.5,
    borderTopRightRadius: windowHeight * 0.5,
    transform: [{ translateY: windowHeight * 0.05 }]
  },

  // --- Background Bubble Styles ---
  backgroundBubbleBase: {
      position: 'absolute',
      // Bubbles should be behind everything visual except the root background
      zIndex: 0,
  },
  bubble1: {
      width: windowWidth * 0.6, // Large bubble
      height: windowWidth * 0.6,
      borderRadius: windowWidth * 0.3,
      backgroundColor: BUBBLE_COLOR_1,
      top: -windowWidth * 0.2, // Position partially off-screen top-left
      left: -windowWidth * 0.25,
  },
  bubble2: {
      width: windowWidth * 0.4, // Medium bubble
      height: windowWidth * 0.4,
      borderRadius: windowWidth * 0.2,
      backgroundColor: BUBBLE_COLOR_2,
      top: windowHeight * 0.2, // Position near middle-right
      right: -windowWidth * 0.15, // Partially off-screen
  },
  bubble3: {
      width: windowWidth * 0.3, // Small bubble
      height: windowWidth * 0.3,
      borderRadius: windowWidth * 0.15,
      backgroundColor: BUBBLE_COLOR_1,
      bottom: windowHeight * 0.15, // Position near bottom-left (above curve)
      left: windowWidth * 0.05,
  },
   bubble4: {
      width: windowWidth * 0.5, // Another medium/large one
      height: windowWidth * 0.5,
      borderRadius: windowWidth * 0.25,
      backgroundColor: BUBBLE_COLOR_2,
      bottom: -windowWidth * 0.1, // Position partially below bottom curve start
      right: -windowWidth * 0.1,
  },
});