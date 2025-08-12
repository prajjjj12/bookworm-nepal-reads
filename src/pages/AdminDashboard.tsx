import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Package, LogOut, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAdminAuth } from '@/hooks/useAdminAuth';

interface Order {
  id: string;
  order_number: string;
  buyer_name: string;
  buyer_phone: string;
  buyer_address: string;
  buyer_district: string;
  total_amount: number;
  status: string;
  created_at: string;
}

interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  price: number;
  cover_image?: string;
  description?: string;
}

const GENRES = [
  'Fiction',
  'Non-Fiction',
  'School Textbooks',
  'Self-Help & Motivational',
  "Children's Books"
];

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, logout } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<'books' | 'orders' | 'users'>('books');
  const [books, setBooks] = useState<Book[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    genre: '',
    price: '',
    cover_image: '',
    description: ''
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/admin');
      return;
    }
    
    if (isAuthenticated) {
      fetchBooks();
      fetchOrders();
      fetchUsers();
    }
  }, [navigate, isAuthenticated, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const fetchBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setBooks(data || []);
    } catch (error) {
      console.error('Error fetching books:', error);
      toast.error('Failed to fetch books');
    }
  };

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    }
  };

  const handleAddBook = async () => {
    if (!newBook.title || !newBook.author || !newBook.genre || !newBook.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const { error } = await supabase
        .from('books')
        .insert({
          title: newBook.title,
          author: newBook.author,
          genre: newBook.genre,
          price: parseFloat(newBook.price),
          cover_image: newBook.cover_image || null,
          description: newBook.description || null
        });

      if (error) throw error;

      toast.success('Book added successfully');
      setIsAddDialogOpen(false);
      setNewBook({ title: '', author: '', genre: '', price: '', cover_image: '', description: '' });
      fetchBooks();
    } catch (error) {
      console.error('Error adding book:', error);
      toast.error('Failed to add book');
    }
  };

  const handleUpdateBook = async () => {
    if (!editingBook) return;

    try {
      const { error } = await supabase
        .from('books')
        .update({
          title: editingBook.title,
          author: editingBook.author,
          genre: editingBook.genre,
          price: editingBook.price,
          cover_image: editingBook.cover_image || null,
          description: editingBook.description || null
        })
        .eq('id', editingBook.id);

      if (error) throw error;

      toast.success('Book updated successfully');
      setEditingBook(null);
      fetchBooks();
    } catch (error) {
      console.error('Error updating book:', error);
      toast.error('Failed to update book');
    }
  };

  const handleDeleteBook = async (id: string) => {
    if (!confirm('Are you sure you want to delete this book?')) return;

    try {
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Book deleted successfully');
      fetchBooks();
    } catch (error) {
      console.error('Error deleting book:', error);
      toast.error('Failed to delete book');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;

      toast.success('Order status updated');
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      // First delete from profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', userId);

      if (profileError) throw profileError;

      // Then delete from auth.users table
      const { error: userError } = await supabase.auth.admin.deleteUser(userId);

      if (userError) throw userError;

      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-primary">Bookworm Admin</h1>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => navigate('/')}>
                <Eye className="h-4 w-4 mr-2" />
                View Store
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8">
          <Button
            variant={activeTab === 'books' ? 'default' : 'outline'}
            onClick={() => setActiveTab('books')}
          >
            Books Management
          </Button>
          <Button
            variant={activeTab === 'orders' ? 'default' : 'outline'}
            onClick={() => setActiveTab('orders')}
          >
            <Package className="h-4 w-4 mr-2" />
            Orders ({orders.length})
          </Button>
          <Button
            variant={activeTab === 'users' ? 'default' : 'outline'}
            onClick={() => setActiveTab('users')}
          >
            Users
          </Button>
        </div>

        {/* Books Management */}
        {activeTab === 'books' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Books ({books.length})</h2>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Book
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Book</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Title *</Label>
                      <Input
                        value={newBook.title}
                        onChange={(e) => setNewBook(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Book title"
                      />
                    </div>
                    <div>
                      <Label>Author *</Label>
                      <Input
                        value={newBook.author}
                        onChange={(e) => setNewBook(prev => ({ ...prev, author: e.target.value }))}
                        placeholder="Author name"
                      />
                    </div>
                    <div>
                      <Label>Genre *</Label>
                      <Select onValueChange={(value) => setNewBook(prev => ({ ...prev, genre: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select genre" />
                        </SelectTrigger>
                        <SelectContent>
                          {GENRES.map(genre => (
                            <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Price (Rs.) *</Label>
                      <Input
                        type="number"
                        value={newBook.price}
                        onChange={(e) => setNewBook(prev => ({ ...prev, price: e.target.value }))}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label>Cover Image URL</Label>
                      <Input
                        value={newBook.cover_image}
                        onChange={(e) => setNewBook(prev => ({ ...prev, cover_image: e.target.value }))}
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={newBook.description}
                        onChange={(e) => setNewBook(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Book description"
                      />
                    </div>
                    <Button onClick={handleAddBook} className="w-full">
                      Add Book
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {books.map((book) => (
                <Card key={book.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-20 bg-muted rounded flex-shrink-0 flex items-center justify-center">
                            {book.cover_image ? (
                              <img src={book.cover_image} alt={book.title} className="w-full h-full object-cover rounded" />
                            ) : (
                              <span>📚</span>
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">{book.title}</h3>
                            <p className="text-sm text-muted-foreground">by {book.author}</p>
                            <Badge variant="secondary" className="mt-1">{book.genre}</Badge>
                            <p className="text-lg font-semibold text-primary mt-2">Rs. {book.price.toLocaleString()}</p>
                            {book.description && (
                              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{book.description}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingBook(book)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteBook(book.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Orders Management */}
        {activeTab === 'orders' && (
          <div>
            <h2 className="text-xl font-semibold mb-6">Orders Management</h2>
            <div className="grid gap-4">
              {orders.map((order) => (
                <Card key={order.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <h3 className="font-semibold">Order {order.order_number}</h3>
                          <Badge variant={
                            order.status === 'Pending' ? 'secondary' :
                            order.status === 'Shipped' ? 'default' : 'destructive'
                          }>
                            {order.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p><strong>Customer:</strong> {order.buyer_name}</p>
                            <p><strong>Phone:</strong> {order.buyer_phone}</p>
                            <p><strong>District:</strong> {order.buyer_district}</p>
                          </div>
                          <div>
                            <p><strong>Address:</strong> {order.buyer_address}</p>
                            <p><strong>Total:</strong> Rs. {order.total_amount.toLocaleString()}</p>
                            <p><strong>Date:</strong> {new Date(order.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Select
                          value={order.status}
                          onValueChange={(value) => handleUpdateOrderStatus(order.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Shipped">Shipped</SelectItem>
                            <SelectItem value="Delivered">Delivered</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Users Management */}
        {activeTab === 'users' && (
          <div>
            <h2 className="text-xl font-semibold mb-6">Users Management</h2>
            <div className="grid gap-4">
              {users.map((user) => (
                <Card key={user.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h3 className="font-semibold">{user.name}</h3>
                            <p className="text-sm text-muted-foreground">ID: {user.user_id}</p>
                            <p className="text-sm">📞 {user.phone || 'Not provided'}</p>
                            <p className="text-sm">📍 {user.location || 'Not provided'}</p>
                          </div>
                          <div>
                            <p className="text-sm"><strong>Joined:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
                            <p className="text-sm"><strong>Updated:</strong> {new Date(user.updated_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                       </div>
                       <div className="flex gap-2">
                         <Button
                           variant="outline"
                           size="sm"
                           onClick={() => handleDeleteUser(user.user_id)}
                         >
                           <Trash2 className="h-4 w-4" />
                         </Button>
                       </div>
                     </div>
                   </CardContent>
                </Card>
              ))}
              {users.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No users found.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Edit Book Dialog */}
        <Dialog open={!!editingBook} onOpenChange={() => setEditingBook(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Book</DialogTitle>
            </DialogHeader>
            {editingBook && (
              <div className="space-y-4">
                <div>
                  <Label>Title *</Label>
                  <Input
                    value={editingBook.title}
                    onChange={(e) => setEditingBook(prev => prev ? ({ ...prev, title: e.target.value }) : null)}
                  />
                </div>
                <div>
                  <Label>Author *</Label>
                  <Input
                    value={editingBook.author}
                    onChange={(e) => setEditingBook(prev => prev ? ({ ...prev, author: e.target.value }) : null)}
                  />
                </div>
                <div>
                  <Label>Genre *</Label>
                  <Select
                    value={editingBook.genre}
                    onValueChange={(value) => setEditingBook(prev => prev ? ({ ...prev, genre: value }) : null)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {GENRES.map(genre => (
                        <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Price (Rs.) *</Label>
                  <Input
                    type="number"
                    value={editingBook.price}
                    onChange={(e) => setEditingBook(prev => prev ? ({ ...prev, price: parseFloat(e.target.value) || 0 }) : null)}
                  />
                </div>
                <div>
                  <Label>Cover Image URL</Label>
                  <Input
                    value={editingBook.cover_image || ''}
                    onChange={(e) => setEditingBook(prev => prev ? ({ ...prev, cover_image: e.target.value }) : null)}
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={editingBook.description || ''}
                    onChange={(e) => setEditingBook(prev => prev ? ({ ...prev, description: e.target.value }) : null)}
                  />
                </div>
                <Button onClick={handleUpdateBook} className="w-full">
                  Update Book
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};