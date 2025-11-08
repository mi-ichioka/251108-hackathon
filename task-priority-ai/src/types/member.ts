export interface Member {
  id: string;
  name: string;
  avatar: string;
  color: string;
}

export const MEMBERS: Member[] = [
  {
    id: 'member-1',
    name: '山田太郎',
    avatar: '/member1.png',
    color: '#3b82f6', // blue
  },
  {
    id: 'member-2',
    name: '佐藤花子',
    avatar: '/member2.png',
    color: '#ef4444', // red
  },
  {
    id: 'member-3',
    name: '鈴木一郎',
    avatar: '/member3.png',
    color: '#10b981', // green
  },
  {
    id: 'member-4',
    name: '田中美咲',
    avatar: '/member4.png',
    color: '#f59e0b', // orange
  },
  {
    id: 'member-5',
    name: '高橋健太',
    avatar: '/member5.png',
    color: '#8b5cf6', // purple
  },
];
