
import { View, Text, Button, StyleSheet } from 'react-native';

export default function LoginScreen({ onLogin }) {
  return (
    <View style={styles.container}>
      <Text>Login</Text>
      <Button
        title="Entrar"
        onPress={onLogin}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
});
