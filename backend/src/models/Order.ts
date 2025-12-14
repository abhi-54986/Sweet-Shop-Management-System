import mongoose, { Document, Schema } from 'mongoose';

interface IOrderItem {
  sweet: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
}

interface IDeliveryAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
}

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  items: IOrderItem[];
  totalAmount: number;
  status: 'Pending' | 'Processing' | 'Completed' | 'Cancelled';
  deliveryAddress: IDeliveryAddress;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [
      {
        sweet: {
          type: Schema.Types.ObjectId,
          ref: 'Sweet',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['Pending', 'Processing', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
    deliveryAddress: {
      street: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      zipCode: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model<IOrder>('Order', orderSchema);

export default Order;