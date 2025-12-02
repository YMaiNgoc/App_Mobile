import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
// Nếu bạn sử dụng navigation, bạn cần định nghĩa kiểu props.
// Giả sử nó là một màn hình trong HomeStack.
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from './types'; // Thay thế bằng đường dẫn file types của bạn

// Định nghĩa kiểu cho props (nếu bạn muốn dùng navigation)
type AboutScreenProps = NativeStackScreenProps<HomeStackParamList, 'About'>;
const AboutScreen: React.FC<AboutScreenProps> = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Về Cửa Hàng Thời Trang ABC</Text>
      
      {/* Thêm hình ảnh logo hoặc trụ sở */}
      <Image 
        source={require('./banner.jpg')} // Thay thế bằng đường dẫn hình ảnh thực tế của bạn
        style={styles.image}
      />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎯 Sứ Mệnh Của Chúng Tôi</Text>
        <Text style={styles.paragraph}>
          Sứ mệnh của ABC là mang đến những sản phẩm thời trang chất lượng cao, 
          phong cách và giá cả phải chăng cho mọi người. Chúng tôi tin rằng thời trang là một cách để 
          thể hiện cá tính, và mọi người đều xứng đáng có những bộ trang phục khiến họ tự tin nhất.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🌟 Giá Trị Cốt Lõi</Text>
        <Text style={styles.list}>- Chất lượng: Cam kết về chất liệu và độ bền sản phẩm.</Text>
        <Text style={styles.list}>- Đổi mới: Liên tục cập nhật các xu hướng thời trang mới nhất.</Text>
        <Text style={styles.list}>- Khách hàng là trung tâm: Dịch vụ hỗ trợ tận tâm và chuyên nghiệp.</Text>
        <Text style={styles.list}>- Bền vững: Hướng tới các quy trình sản xuất thân thiện với môi trường.</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👥 Đội Ngũ Của Chúng Tôi</Text>
        <Text style={styles.paragraph}>
          Được thành lập vào năm 2020, ABC đã phát triển nhờ vào đội ngũ những người trẻ đầy nhiệt huyết, 
          sáng tạo và có kinh nghiệm sâu sắc trong ngành thời trang. Chúng tôi luôn làm việc với niềm đam mê 
          để đem lại trải nghiệm mua sắm tuyệt vời nhất cho quý khách hàng.
        </Text>
      </View>
      
      <Text style={styles.footer}>Cảm ơn bạn đã tin tưởng và đồng hành cùng ABC!</Text>
    </ScrollView>
  );
};

// ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
    alignItems: 'center', // Căn giữa nội dung chính
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    marginBottom: 20,
    resizeMode: 'cover',
  },
  section: {
    width: '100%',
    marginBottom: 25,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E91E63', // Màu hồng/đỏ nổi bật
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 5,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
  },
  list: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
    marginLeft: 10,
  },
  footer: {
    fontSize: 14,
    marginTop: 10,
    fontStyle: 'italic',
    color: '#777',
  }
});

export default AboutScreen;