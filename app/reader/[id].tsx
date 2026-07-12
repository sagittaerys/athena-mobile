import { View, Text } from 'react-native'
import { useLocalSearchParams } from 'expo-router'

export default function ReaderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()

  return (
    <View>
      <Text>Reader for book {id}</Text>
    </View>
  )
}