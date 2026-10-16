import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  Button,
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { db } from '../../firebaseConfig';

interface Produto {
  id: string;
  nome: string;
  quantidade: number;
}

export default function HomeScreen() {
  const [nome, setNome] = useState('');
  const [produtos, setProdutos] = useState<Produto[]>([]);

  // Carrega em tempo real da coleção 'compras'
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'compras'), (snapshot) => {
      const docs: Produto[] = snapshot.docs.map((d) => ({
        id: d.id,
        nome: d.data().nome ?? '',
        quantidade: d.data().quantidade ?? 1,
      }));
      setProdutos(docs);
    });

    return () => unsub();
  }, []);

  // Adiciona novo produto com quantidade inicial 1
  const handleAdicionar = async () => {
    if (!nome.trim()) return;
    try {
      await addDoc(collection(db, 'compras'), {
        nome: nome,
        quantidade: 1,
      });
      setNome('');
    } catch (error) {
      console.error('Erro ao adicionar:', error);
    }
  };

  // -----------------------------------------------------------
  // SUA TAREFA 1: IMPLEMENTADA COM SUCESSO!
  // -----------------------------------------------------------
  const handleAumentarQuantidade = async (id: string, quantidadeAtual: number) => {
    try {
      const itemRef = doc(db, 'compras', id);
      await updateDoc(itemRef, {
        quantidade: quantidadeAtual + 1,
      });
      console.log('Quantidade de item atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar quantidade:', error);
    }
  };

  // -----------------------------------------------------------
  // SUA TAREFA 2: IMPLEMENTADA COM SUCESSO!
  // -----------------------------------------------------------
  const handleRemover = async (id: string) => {
    try {
      const itemRef = doc(db, 'compras', id);
      await deleteDoc(itemRef);
      console.log('Compra excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao remover:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Text style={styles.title}>🛒 Lista de Compras</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nome do produto (ex: Leite)"
          value={nome}
          onChangeText={setNome}
          placeholderTextColor="#888"
        />
        <Button title="Adicionar" onPress={handleAdicionar} />
      </View>

      <FlatList
        data={produtos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.info}>
              <Text style={styles.nome}>{item.nome}</Text>
              <Text style={styles.quantidade}>Qtd: {item.quantidade}</Text>
            </View>

            <View style={styles.acoes}>
              {/* Botão +1 */}
              <TouchableOpacity 
                style={styles.botaoQtd}
                onPress={() => handleAumentarQuantidade(item.id, item.quantidade)}
              >
                <Text style={styles.textoBotao}>+1</Text>
              </TouchableOpacity>

              {/* Botão Excluir */}
              <TouchableOpacity 
                style={styles.botaoRemover}
                onPress={() => handleRemover(item.id)}
              >
                <Text style={styles.textoBotao}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f4f4f4',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  card: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 1,
  },
  info: {
    flex: 1,
  },
  nome: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  quantidade: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  acoes: {
    flexDirection: 'row',
    gap: 8,
  },
  botaoQtd: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  botaoRemover: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  textoBotao: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});