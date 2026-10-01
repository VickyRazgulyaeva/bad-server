import { unlink } from 'fs'
import mongoose, { Document } from 'mongoose'
import { basename, join } from 'path'

export interface IFile {
    fileName: string
    originalName: string
}

export interface IProduct extends Document {
    title: string
    image: IFile
    category: string
    description: string
    price: number
}

const getImagePath = (fileName: string) =>
    join(__dirname, '../public/images', basename(fileName))

const removeImage = (fileName?: string) => {
    if (!fileName) {
        return
    }

    unlink(getImagePath(fileName), () => {})
}

const cardsSchema = new mongoose.Schema<IProduct>(
    {
        title: {
            type: String,
            unique: true,
            required: [true, 'Поле "title" должно быть заполнено'],
            minlength: [2, 'Минимальная длина поля "title" - 2'],
            maxlength: [30, 'Максимальная длина поля "title" - 30'],
        },
        image: {
            fileName: {
                type: String,
                required: [true, 'Поле "image.fileName" должно быть заполнено'],
            },
            originalName: String,
        },
        category: {
            type: String,
            required: [true, 'Поле "category" должно быть заполнено'],
        },
        description: {
            type: String,
        },
        price: {
            type: Number,
            default: null,
        },
    },
    { versionKey: false }
)

cardsSchema.index({ title: 'text' })

cardsSchema.pre('findOneAndUpdate', async function deleteOldImage() {
    // @ts-ignore
    const updateImage = this.getUpdate().$set?.image
    const docToUpdate = await this.model.findOne(this.getQuery())

    if (updateImage && docToUpdate?.image?.fileName) {
        removeImage(docToUpdate.image.fileName)
    }
})

cardsSchema.post('findOneAndDelete', async (doc: IProduct | null) => {
    if (doc?.image?.fileName) {
        removeImage(doc.image.fileName)
    }
})

export default mongoose.model<IProduct>('product', cardsSchema)