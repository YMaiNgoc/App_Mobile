// CategorySelector.tsx
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native';
import { Category } from './database';

interface Props {
  categories: Category[];
  selectedId: number;
  onSelect: (id: number) => void;
}

export default function CategorySelector({ categories, selectedId, onSelect }: Props) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.container}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.button, selectedId === cat.id && styles.activeButton]}
            onPress={() => onSelect(cat.id)}
          >
            <Text style={[styles.text, selectedId === cat.id && styles.activeText]}>{cat.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
    justifyContent: 'flex-start', 
  },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#ddd',
    borderRadius: 20,
    minWidth: 60,         
    maxWidth: 120,       
    marginRight: 8,
    marginBottom: 8,   
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: '#007bff',
  },
  text: {
    color: '#000',
    fontSize: 14,
  },
  activeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});