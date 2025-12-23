import axios from 'axios';
import { Complaint } from '../../types';

// Get the base URL - use the new Vercel URL
const API_BASE_URL = 'https://dag-system-drmwt3ekc-ibrahem-saieds-projects.vercel.app/api/v1';

// Create axios instance with default config
const complaintsApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include token
complaintsApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
complaintsApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Optionally redirect to login
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

/**
 * Fetch all complaints from the backend
 */
export const getAllComplaints = async (): Promise<Complaint[]> => {
  try {
    const response = await complaintsApi.get('/complaint');
    let complaints: Complaint[] = [];
    
    // Handle different response structures
    if (response.data.data) {
      complaints = Array.isArray(response.data.data) ? response.data.data : [response.data.data];
    } else if (Array.isArray(response.data)) {
      complaints = response.data;
    } else {
      return [];
    }
    
    // Transform each complaint from backend format to frontend format
    return complaints.map(transformComplaintFromBackend);
  } catch (error: any) {
    console.error('Error fetching complaints:', error);
    throw error;
  }
};

/**
 * Fetch a single complaint by ID
 */
export const getComplaintById = async (id: string): Promise<Complaint> => {
  try {
    const response = await complaintsApi.get(`/complaint/${id}`);
    let complaint;
    if (response.data.data) {
      complaint = response.data.data;
    } else {
      complaint = response.data;
    }
    return transformComplaintFromBackend(complaint);
  } catch (error: any) {
    console.error('Error fetching complaint:', error);
    throw error;
  }
};

/**
 * Compress base64 image to reduce size
 */
const compressBase64Image = (base64String: string, maxSizeKB: number = 300): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      let quality = 0.8;

      // Calculate target dimensions to reduce size
      const maxDimension = 1200;
      if (width > maxDimension || height > maxDimension) {
        const ratio = Math.min(maxDimension / width, maxDimension / height);
        width = width * ratio;
        height = height * ratio;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);

      // Try different quality levels to get under maxSizeKB
      const tryCompress = (q: number) => {
        const compressed = canvas.toDataURL('image/jpeg', q);
        const sizeKB = (compressed.length * 3) / 4 / 1024; // Approximate size in KB
        
        if (sizeKB <= maxSizeKB || q <= 0.3) {
          resolve(compressed);
        } else {
          tryCompress(q - 0.1);
        }
      };

      tryCompress(quality);
    };
    img.onerror = () => resolve(base64String); // Return original if compression fails
    img.src = base64String;
  });
};

/**
 * Transform frontend Complaint to backend format
 * Backend expects: type, customer (not customerId), status (valid enum), and compressed attachments
 */
const transformComplaintToBackend = async (complaint: any): Promise<any> => {
  // Compress attachments if they exist
  let compressedAttachments: string[] = [];
  if (complaint.attachments && complaint.attachments.length > 0) {
    console.log(`Compressing ${complaint.attachments.length} images...`);
    compressedAttachments = await Promise.all(
      complaint.attachments.map((img: string) => compressBase64Image(img, 300)) // Max 300KB per image
    );
    console.log('Images compressed successfully');
  }

  // Validate and ensure status is correct
  const validStatuses = ['مفتوحة', 'قيد المراجعة', 'في انتظار رد العميل', 'تم الحل', 'مُصعَّدة'];
  let status = complaint.status || 'مفتوحة';
  if (!validStatuses.includes(status)) {
    console.warn(`Invalid status "${status}", defaulting to "مفتوحة"`);
    status = 'مفتوحة';
  }

  // Transform to backend format
  // Backend expects: customer (not customerId), type (not title), and no complaintId
  const backendComplaint: any = {
    type: complaint.type, // Backend expects 'type'
    customer: complaint.customerId, // Backend expects 'customer' field with customerId value
    description: complaint.description,
    channel: complaint.channel,
    priority: complaint.priority,
    status: status,
    dateOpened: complaint.dateOpened,
    dateClosed: complaint.dateClosed || null,
    assignedTo: complaint.assignedTo || undefined,
    resolutionNotes: complaint.resolutionNotes || '',
    productId: complaint.productId || undefined,
    productColor: complaint.productColor || undefined,
    productSize: complaint.productSize || undefined,
    attachments: compressedAttachments,
    log: complaint.log || [],
    lastModified: complaint.lastModified || new Date().toISOString(),
    // Include customerName if available (backend might need it)
    customerName: complaint.customerName || '',
  };

  // Remove undefined fields
  Object.keys(backendComplaint).forEach(key => {
    if (backendComplaint[key] === undefined) {
      delete backendComplaint[key];
    }
  });

  return backendComplaint;
};

/**
 * Transform backend Complaint to frontend format
 */
const transformComplaintFromBackend = (backendComplaint: any): Complaint => {
  return {
    complaintId: backendComplaint.complaintId || backendComplaint._id,
    customerId: backendComplaint.customerId || backendComplaint.customer?._id || backendComplaint.customer,
    customerName: backendComplaint.customerName || backendComplaint.customer?.name || '',
    dateOpened: backendComplaint.dateOpened,
    channel: backendComplaint.channel,
    type: backendComplaint.type,
    priority: backendComplaint.priority,
    status: backendComplaint.status,
    description: backendComplaint.description,
    assignedTo: backendComplaint.assignedTo,
    resolutionNotes: backendComplaint.resolutionNotes || '',
    dateClosed: backendComplaint.dateClosed,
    log: backendComplaint.log || [],
    productId: backendComplaint.productId,
    productColor: backendComplaint.productColor,
    productSize: backendComplaint.productSize,
    attachments: backendComplaint.attachments || [],
    lastModified: backendComplaint.lastModified,
  } as Complaint;
};

/**
 * Create a new complaint
 */
export const createComplaint = async (complaint: Omit<Complaint, 'complaintId'>): Promise<Complaint> => {
  try {
    // Transform to backend format
    const backendComplaint = await transformComplaintToBackend(complaint);
    
    console.log('Sending complaint to backend:', {
      type: backendComplaint.type,
      customer: backendComplaint.customer,
      status: backendComplaint.status,
      attachmentsCount: backendComplaint.attachments?.length || 0,
    });
    
    const response = await complaintsApi.post('/complaint', backendComplaint);
    
    let createdComplaint;
    if (response.data.data) {
      createdComplaint = response.data.data;
    } else {
      createdComplaint = response.data;
    }
    
    // Transform back to frontend format
    return transformComplaintFromBackend(createdComplaint);
  } catch (error: any) {
    console.error('Error creating complaint:', error);
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
};

/**
 * Update an existing complaint
 * @param id - MongoDB _id or complaintId
 * @param complaint - Complaint data to update
 */
export const updateComplaint = async (id: string, complaint: Partial<Complaint>): Promise<Complaint> => {
  try {
    // Transform to backend format
    const backendComplaint = await transformComplaintToBackend(complaint);
    
    // Use MongoDB _id for the route parameter
    const response = await complaintsApi.put(`/complaint/${id}`, backendComplaint);
    
    let updatedComplaint;
    if (response.data.data) {
      updatedComplaint = response.data.data;
    } else {
      updatedComplaint = response.data;
    }
    
    // Transform back to frontend format
    const transformed = transformComplaintFromBackend(updatedComplaint);
    
    // Preserve original complaintId if backend doesn't return it
    if (!transformed.complaintId && complaint.complaintId) {
      transformed.complaintId = complaint.complaintId;
    }
    
    return transformed;
  } catch (error: any) {
    console.error('Error updating complaint:', error);
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
};

/**
 * Delete a complaint
 */
export const deleteComplaint = async (id: string): Promise<void> => {
  try {
    await complaintsApi.delete(`/complaint/${id}`);
  } catch (error: any) {
    console.error('Error deleting complaint:', error);
    throw error;
  }
};

