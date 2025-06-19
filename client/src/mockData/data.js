// Shared mock data for doctors and services
export const doctors = [
  {
    id: '1',
    name: 'TS.BS Nguyễn Văn A',
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
    gender: 'Nam',
    specialty: 'HIV/AIDS',
    schedule: 'Thứ 2-6: 8:00-17:00',
    price: '300.000đ',
    description: 'TS.BS Nguyễn Văn A có hơn 15 năm kinh nghiệm trong điều trị HIV/AIDS, chuyên nghiên cứu về đánh giá hiệu quả liệu pháp ARV và tư vấn toàn diện cho bệnh nhân.',
  },
  {
    id: '2',
    name: 'BS.CKI Trần Thị B',
    image: 'https://randomuser.me/api/portraits/women/44.jpg',
    gender: 'Nữ',
    specialty: 'HIV/AIDS',
    schedule: 'Thứ 2-6: 8:00-17:00',
    price: '250.000đ',
    description: 'BS.CKI Trần Thị B có kinh nghiệm 12 năm trong chẩn đoán và điều trị HIV/AIDS, nổi tiếng với kỹ năng khám lâm sàng và tư vấn tâm lý cho bệnh nhân.',
  },
  {
    id: '3',
    name: 'BS Lê Văn C',
    image: 'https://randomuser.me/api/portraits/men/45.jpg',
    gender: 'Nam',
    specialty: 'HIV/AIDS',
    schedule: 'Thứ 3,5,7: 14:00-18:00',
    price: '200.000đ',
    description: 'BS Lê Văn C chuyên tâm lý HIV/AIDS, hỗ trợ bệnh nhân vượt qua căng thẳng và tăng cường tuân thủ điều trị thông qua các buổi tư vấn chuyên sâu.',
  },
  {
    id: '4',
    name: 'BS Phạm Thị D',
    image: 'https://randomuser.me/api/portraits/women/65.jpg',
    gender: 'Nữ',
    specialty: 'HIV/AIDS',
    schedule: 'Thứ 2-7: 7:00-16:00',
    price: '220.000đ',
    description: 'BS Phạm Thị D có thành tích xuất sắc trong lĩnh vực xét nghiệm HIV và tư vấn liệu pháp ARV, cam kết chất lượng và an toàn cho bệnh nhân.',
  }
];

export const services = [
  {
    id: 'screening',
    name: 'Xét nghiệm sàng lọc HIV',
    subtitle: 'Sàng lọc HIV từ giai đoạn sớm',
    price: '150.000đ',
    duration: '15-20 phút',
    icon: '🔬',
    features: [
      'Sàng lọc từ giai đoạn sớm',
      'Kết quả nhanh',
      'Bảo mật tuyệt đối'
    ],
    link: '/services/screening'
  },
  {
    id: 'confirm',
    name: 'Xét nghiệm khẳng định HIV',
    subtitle: 'Dùng cho trường hợp test Combo có phản ứng',
    price: '800.000đ',
    duration: '2-3 ngày',
    icon: '✅',
    features: [
      'Độ chính xác cao',
      'Công nghệ hiện đại',
      'Báo cáo chi tiết'
    ],
    link: '/services/confirm'
  },
  {
    id: 'pep',
    name: 'PEP - Dự phòng sau phơi nhiễm HIV',
    subtitle: 'Miễn phí, trong vòng 72h',
    price: '2.500.000đ',
    duration: '28 ngày',
    icon: '💊',
    features: [
      'Hiệu quả lên đến 99%',
      'Trong vòng 72h',
      'Theo dõi chuyên nghiệp'
    ],
    link: '/services/pep'
  }
];
