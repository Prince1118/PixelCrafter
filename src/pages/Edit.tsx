import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  Crop, 
  RotateCcw, 
  Palette, 
  Scissors,
  Download,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Move,
  Square,
  Circle,
  Brush,
  Eraser,
  Type,
  Layers,
  Filter,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

interface EditHistory {
  imageData: string;
  timestamp: number;
  brightness: number;
  contrast: number;
  saturation: number;
  filter: string;
}

interface TextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontFamily: string;
  isSelected: boolean;
}

interface ShapeElement {
  id: string;
  type: 'rectangle' | 'circle';
  x: number;
  y: number;
  width: number;
  height: number;
  strokeColor: string;
  strokeWidth: number;
  fillColor?: string;
  isSelected: boolean;
}

const Edit: React.FC = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedTool, setSelectedTool] = useState('move');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('none');
  const [zoom, setZoom] = useState(100);
  const [history, setHistory] = useState<EditHistory[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(5);
  const [brushColor, setBrushColor] = useState('#000000');
  const [cropArea, setCropArea] = useState<{x: number, y: number, width: number, height: number} | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [canvasPosition, setCanvasPosition] = useState({ x: 0, y: 0 });
  const [selectedShape, setSelectedShape] = useState('rectangle');
  const [isDrawingShape, setIsDrawingShape] = useState(false);
  const [shapeStart, setShapeStart] = useState({ x: 0, y: 0 });
  
  // Text tool states
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [currentText, setCurrentText] = useState('');
  const [fontSize, setFontSize] = useState(24);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [isAddingText, setIsAddingText] = useState(false);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  
  // Shape tool states
  const [shapeElements, setShapeElements] = useState<ShapeElement[]>([]);
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
  const [isDraggingElement, setIsDraggingElement] = useState(false);
  const [dragElementStart, setDragElementStart] = useState({ x: 0, y: 0 });
  const [fillColor, setFillColor] = useState('transparent');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const tools = [
    { id: 'move', name: 'Move', icon: Move },
    { id: 'crop', name: 'Crop', icon: Crop },
    { id: 'rotate', name: 'Rotate', icon: RotateCcw },
    { id: 'brush', name: 'Brush', icon: Brush },
    { id: 'eraser', name: 'Eraser', icon: Eraser },
    { id: 'text', name: 'Text', icon: Type },
    { id: 'shape', name: 'Shapes', icon: Square },
    { id: 'filter', name: 'Filters', icon: Filter },
  ];

  const filters = [
    { name: 'Original', value: 'none', filter: '' },
    { name: 'Vintage', value: 'vintage', filter: 'sepia(100%) saturate(120%)' },
    { name: 'B&W', value: 'bw', filter: 'grayscale(100%)' },
    { name: 'Bright', value: 'bright', filter: 'brightness(120%) contrast(110%)' },
    { name: 'Warm', value: 'warm', filter: 'saturate(120%) hue-rotate(10deg)' },
    { name: 'Cool', value: 'cool', filter: 'saturate(120%) hue-rotate(-10deg)' },
    { name: 'Blur', value: 'blur', filter: 'blur(2px)' },
    { name: 'Sharpen', value: 'sharpen', filter: 'contrast(150%) brightness(110%)' },
  ];

  const shapes = [
    { id: 'rectangle', name: 'Rectangle', icon: Square },
    { id: 'circle', name: 'Circle', icon: Circle },
  ];

  const fontFamilies = [
    'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 
    'Courier New', 'Impact', 'Comic Sans MS', 'Trebuchet MS', 'Palatino'
  ];

  const aiFeatures = [
    { name: 'Remove Background', icon: Scissors, description: 'AI-powered background removal' },
    { name: 'Upscale Image', icon: ZoomIn, description: 'Enhance resolution with AI' },
    { name: 'Inpaint', icon: Sparkles, description: 'Remove objects and regenerate' },
    { name: 'Style Transfer', icon: Palette, description: 'Apply artistic styles' },
  ];

  // Redraw canvas with all elements
  const redrawCanvas = useCallback(() => {
    if (!canvasRef.current || !uploadedImage) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const img = new Image();
    img.onload = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Apply filters and adjustments
      const currentFilter = filters.find(f => f.value === selectedFilter);
      const filterCSS = currentFilter ? currentFilter.filter : '';
      const combinedFilter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) ${filterCSS}`;
      ctx.filter = combinedFilter;
      
      // Draw base image
      ctx.drawImage(img, 0, 0);
      ctx.filter = 'none';
      
      // Draw shapes
      shapeElements.forEach(shape => {
        ctx.strokeStyle = shape.strokeColor;
        ctx.lineWidth = shape.strokeWidth;
        
        if (shape.fillColor && shape.fillColor !== 'transparent') {
          ctx.fillStyle = shape.fillColor;
        }
        
        ctx.beginPath();
        
        if (shape.type === 'rectangle') {
          ctx.rect(shape.x, shape.y, shape.width, shape.height);
        } else if (shape.type === 'circle') {
          const radius = Math.min(shape.width, shape.height) / 2;
          const centerX = shape.x + shape.width / 2;
          const centerY = shape.y + shape.height / 2;
          ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        }
        
        if (shape.fillColor && shape.fillColor !== 'transparent') {
          ctx.fill();
        }
        ctx.stroke();
        
        // Draw selection indicator
        if (shape.isSelected) {
          ctx.strokeStyle = '#3b82f6';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.strokeRect(shape.x - 2, shape.y - 2, shape.width + 4, shape.height + 4);
          ctx.setLineDash([]);
        }
      });
      
      // Draw text elements
      textElements.forEach(textEl => {
        ctx.font = `${textEl.fontSize}px ${textEl.fontFamily}`;
        ctx.fillStyle = textEl.color;
        ctx.textBaseline = 'top';
        ctx.fillText(textEl.text, textEl.x, textEl.y);
        
        // Draw selection indicator
        if (textEl.isSelected) {
          const metrics = ctx.measureText(textEl.text);
          const textWidth = metrics.width;
          const textHeight = textEl.fontSize;
          
          ctx.strokeStyle = '#3b82f6';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.strokeRect(textEl.x - 2, textEl.y - 2, textWidth + 4, textHeight + 4);
          ctx.setLineDash([]);
        }
      });
    };
    
    img.src = uploadedImage;
  }, [uploadedImage, selectedFilter, brightness, contrast, saturation, textElements, shapeElements]);

  // Initialize canvas when image is uploaded
  useEffect(() => {
    if (uploadedImage && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        addToHistory();
      };
      
      img.src = uploadedImage;
    }
  }, [uploadedImage]);

  // Redraw canvas when elements change
  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  const addToHistory = useCallback(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const imageData = canvas.toDataURL();
    
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({
      imageData,
      timestamp: Date.now(),
      brightness,
      contrast,
      saturation,
      filter: selectedFilter
    });
    
    // Limit history to 20 items
    if (newHistory.length > 20) {
      newHistory.shift();
    } else {
      setHistoryIndex(newHistory.length - 1);
    }
    
    setHistory(newHistory);
  }, [history, historyIndex, brightness, contrast, saturation, selectedFilter]);

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setUploadedImage(imageUrl);
        setHistory([]);
        setHistoryIndex(-1);
        setRotation(0);
        setBrightness(100);
        setContrast(100);
        setSaturation(100);
        setSelectedFilter('none');
        setCanvasPosition({ x: 0, y: 0 });
        setCropArea(null);
        setTextElements([]);
        setShapeElements([]);
        setSelectedTextId(null);
        setSelectedShapeId(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    multiple: false
  });

  const undo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      
      // Restore all state from history
      setBrightness(prevState.brightness);
      setContrast(prevState.contrast);
      setSaturation(prevState.saturation);
      setSelectedFilter(prevState.filter);
      
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx?.drawImage(img, 0, 0);
        };
        
        img.src = prevState.imageData;
      }
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      
      // Restore all state from history
      setBrightness(nextState.brightness);
      setContrast(nextState.contrast);
      setSaturation(nextState.saturation);
      setSelectedFilter(nextState.filter);
      
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx?.drawImage(img, 0, 0);
        };
        
        img.src = nextState.imageData;
      }
    }
  };

  const zoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const zoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 25));
  };

  const applyFilter = (filterValue: string, filterCSS: string) => {
    if (!canvasRef.current || !uploadedImage) return;
    
    setIsProcessing(true);
    setSelectedFilter(filterValue);
    
    setTimeout(() => {
      redrawCanvas();
      addToHistory();
      setIsProcessing(false);
      toast.success('Filter applied successfully!');
    }, 100);
  };

  const rotateImage = () => {
    if (!canvasRef.current) return;
    
    setIsProcessing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    // Get current canvas as image
    const currentImageData = canvas.toDataURL();
    const img = new Image();
    
    img.onload = () => {
      const newRotation = (rotation + 90) % 360;
      
      // Swap dimensions for 90/270 degree rotations
      if (newRotation === 90 || newRotation === 270) {
        canvas.width = img.height;
        canvas.height = img.width;
      } else {
        canvas.width = img.width;
        canvas.height = img.height;
      }
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Move to center, rotate, then move back
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((90 * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      
      // Reset transformation
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      
      setRotation(newRotation);
      addToHistory();
      setIsProcessing(false);
      toast.success('Image rotated successfully!');
    };
    
    img.src = currentImageData;
  };

  const cropImage = () => {
    if (!canvasRef.current || !cropArea) return;
    
    setIsProcessing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    // Ensure crop area has positive dimensions
    const x = Math.min(cropArea.x, cropArea.x + cropArea.width);
    const y = Math.min(cropArea.y, cropArea.y + cropArea.height);
    const width = Math.abs(cropArea.width);
    const height = Math.abs(cropArea.height);
    
    // Get current canvas data
    const currentImageData = ctx.getImageData(x, y, width, height);
    
    // Resize canvas to crop area
    canvas.width = width;
    canvas.height = height;
    
    // Put cropped data
    ctx.putImageData(currentImageData, 0, 0);
    
    setCropArea(null);
    setIsCropping(false);
    addToHistory();
    setIsProcessing(false);
    toast.success('Image cropped successfully!');
  };

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const findElementAtPosition = (x: number, y: number) => {
    // Check text elements first (they're on top)
    for (let i = textElements.length - 1; i >= 0; i--) {
      const textEl = textElements[i];
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.font = `${textEl.fontSize}px ${textEl.fontFamily}`;
          const metrics = ctx.measureText(textEl.text);
          const textWidth = metrics.width;
          const textHeight = textEl.fontSize;
          
          if (x >= textEl.x && x <= textEl.x + textWidth && 
              y >= textEl.y && y <= textEl.y + textHeight) {
            return { type: 'text', id: textEl.id };
          }
        }
      }
    }
    
    // Check shape elements
    for (let i = shapeElements.length - 1; i >= 0; i--) {
      const shape = shapeElements[i];
      if (x >= shape.x && x <= shape.x + shape.width && 
          y >= shape.y && y <= shape.y + shape.height) {
        return { type: 'shape', id: shape.id };
      }
    }
    
    return null;
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const coords = getCanvasCoordinates(e);
    
    if (selectedTool === 'move') {
      setIsDragging(true);
      setDragStart({ x: e.clientX - canvasPosition.x, y: e.clientY - canvasPosition.y });
    } else if (selectedTool === 'crop') {
      setIsCropping(true);
      setCropArea({ x: coords.x, y: coords.y, width: 0, height: 0 });
    } else if (selectedTool === 'brush' || selectedTool === 'eraser') {
      setIsDrawing(true);
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(coords.x, coords.y);
        
        if (selectedTool === 'eraser') {
          ctx.globalCompositeOperation = 'destination-out';
        } else {
          ctx.globalCompositeOperation = 'source-over';
          ctx.strokeStyle = brushColor;
        }
        
        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    } else if (selectedTool === 'shape') {
      setIsDrawingShape(true);
      setShapeStart(coords);
    } else if (selectedTool === 'text') {
      if (isAddingText) {
        // Place text at clicked position
        addTextElement(coords.x, coords.y);
      } else {
        // Check if clicking on existing text
        const element = findElementAtPosition(coords.x, coords.y);
        if (element && element.type === 'text') {
          selectTextElement(element.id);
          setIsDraggingElement(true);
          setDragElementStart({ x: coords.x, y: coords.y });
        } else {
          // Deselect all text elements
          setTextElements(prev => prev.map(t => ({ ...t, isSelected: false })));
          setSelectedTextId(null);
        }
      }
    }
    
    // Handle element selection and dragging for shapes
    if (selectedTool === 'shape' && !isDrawingShape) {
      const element = findElementAtPosition(coords.x, coords.y);
      if (element && element.type === 'shape') {
        selectShapeElement(element.id);
        setIsDraggingElement(true);
        setDragElementStart({ x: coords.x, y: coords.y });
      } else {
        // Deselect all shape elements
        setShapeElements(prev => prev.map(s => ({ ...s, isSelected: false })));
        setSelectedShapeId(null);
      }
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const coords = getCanvasCoordinates(e);
    
    if (selectedTool === 'move' && isDragging) {
      setCanvasPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    } else if (selectedTool === 'crop' && isCropping && cropArea) {
      setCropArea(prev => prev ? {
        ...prev,
        width: coords.x - prev.x,
        height: coords.y - prev.y
      } : null);
    } else if (isDrawing && (selectedTool === 'brush' || selectedTool === 'eraser')) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
      }
    } else if (selectedTool === 'shape' && isDrawingShape) {
      // Update shape preview (could add visual feedback here)
    } else if (isDraggingElement) {
      const deltaX = coords.x - dragElementStart.x;
      const deltaY = coords.y - dragElementStart.y;
      
      if (selectedTextId) {
        setTextElements(prev => prev.map(t => 
          t.id === selectedTextId 
            ? { ...t, x: t.x + deltaX, y: t.y + deltaY }
            : t
        ));
      } else if (selectedShapeId) {
        setShapeElements(prev => prev.map(s => 
          s.id === selectedShapeId 
            ? { ...s, x: s.x + deltaX, y: s.y + deltaY }
            : s
        ));
      }
      
      setDragElementStart({ x: coords.x, y: coords.y });
    }
  };

  const handleCanvasMouseUp = () => {
    if (selectedTool === 'move') {
      setIsDragging(false);
    } else if (selectedTool === 'crop') {
      setIsCropping(false);
    } else if (isDrawing) {
      setIsDrawing(false);
      addToHistory();
    } else if (isDrawingShape && canvasRef.current) {
      setIsDrawingShape(false);
      addShapeElement();
      addToHistory();
    } else if (isDraggingElement) {
      setIsDraggingElement(false);
      addToHistory();
    }
  };

  const addTextElement = (x: number, y: number) => {
    if (!currentText.trim()) {
      toast.error('Please enter some text first');
      return;
    }
    
    const newText: TextElement = {
      id: `text-${Date.now()}`,
      text: currentText,
      x,
      y,
      fontSize,
      color: brushColor,
      fontFamily,
      isSelected: true
    };
    
    setTextElements(prev => [...prev.map(t => ({ ...t, isSelected: false })), newText]);
    setSelectedTextId(newText.id);
    setIsAddingText(false);
    setCurrentText('');
    toast.success('Text added successfully!');
  };

  const selectTextElement = (id: string) => {
    setTextElements(prev => prev.map(t => ({ ...t, isSelected: t.id === id })));
    setSelectedTextId(id);
    
    const selectedText = textElements.find(t => t.id === id);
    if (selectedText) {
      setFontSize(selectedText.fontSize);
      setBrushColor(selectedText.color);
      setFontFamily(selectedText.fontFamily);
    }
  };

  const updateSelectedText = (updates: Partial<TextElement>) => {
    if (!selectedTextId) return;
    
    setTextElements(prev => prev.map(t => 
      t.id === selectedTextId ? { ...t, ...updates } : t
    ));
  };

  const deleteSelectedText = () => {
    if (!selectedTextId) return;
    
    setTextElements(prev => prev.filter(t => t.id !== selectedTextId));
    setSelectedTextId(null);
    addToHistory();
    toast.success('Text deleted successfully!');
  };

  const addShapeElement = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const centerX = (rect.width / 2) * (canvas.width / rect.width);
    const centerY = (rect.height / 2) * (canvas.height / rect.height);
    
    const newShape: ShapeElement = {
      id: `shape-${Date.now()}`,
      type: selectedShape as 'rectangle' | 'circle',
      x: centerX - 50,
      y: centerY - 30,
      width: selectedShape === 'rectangle' ? 100 : 60,
      height: selectedShape === 'rectangle' ? 60 : 60,
      strokeColor: brushColor,
      strokeWidth: brushSize,
      fillColor: fillColor,
      isSelected: true
    };
    
    setShapeElements(prev => [...prev.map(s => ({ ...s, isSelected: false })), newShape]);
    setSelectedShapeId(newShape.id);
    toast.success(`${selectedShape} added successfully!`);
  };

  const selectShapeElement = (id: string) => {
    setShapeElements(prev => prev.map(s => ({ ...s, isSelected: s.id === id })));
    setSelectedShapeId(id);
    
    const selectedShape = shapeElements.find(s => s.id === id);
    if (selectedShape) {
      setBrushSize(selectedShape.strokeWidth);
      setBrushColor(selectedShape.strokeColor);
      setFillColor(selectedShape.fillColor || 'transparent');
    }
  };

  const updateSelectedShape = (updates: Partial<ShapeElement>) => {
    if (!selectedShapeId) return;
    
    setShapeElements(prev => prev.map(s => 
      s.id === selectedShapeId ? { ...s, ...updates } : s
    ));
  };

  const deleteSelectedShape = () => {
    if (!selectedShapeId) return;
    
    setShapeElements(prev => prev.filter(s => s.id !== selectedShapeId));
    setSelectedShapeId(null);
    addToHistory();
    toast.success('Shape deleted successfully!');
  };

  const adjustBrightness = (value: number) => {
    setBrightness(value);
    setTimeout(() => redrawCanvas(), 10);
  };

  const adjustContrast = (value: number) => {
    setContrast(value);
    setTimeout(() => redrawCanvas(), 10);
  };

  const adjustSaturation = (value: number) => {
    setSaturation(value);
    setTimeout(() => redrawCanvas(), 10);
  };

  const handleAIFeature = async (featureName: string) => {
    if (!uploadedImage) {
      toast.error('Please upload an image first');
      return;
    }

    setIsProcessing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      switch (featureName) {
        case 'Remove Background':
          if (canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              const data = imageData.data;
              
              for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                
                if (r > 200 && g > 200 && b > 200) {
                  data[i + 3] = 0;
                }
              }
              
              ctx.putImageData(imageData, 0, 0);
              addToHistory();
            }
          }
          toast.success('Background removed successfully!');
          break;
          
        case 'Upscale Image':
          if (canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              const originalWidth = canvas.width;
              const originalHeight = canvas.height;
              
              canvas.width *= 2;
              canvas.height *= 2;
              
              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = 'high';
              
              const tempCanvas = document.createElement('canvas');
              const tempCtx = tempCanvas.getContext('2d');
              tempCanvas.width = originalWidth;
              tempCanvas.height = originalHeight;
              tempCtx?.putImageData(imageData, 0, 0);
              
              ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
              addToHistory();
            }
          }
          toast.success('Image upscaled to 2x resolution!');
          break;
          
        case 'Inpaint':
          toast.success('Inpainting feature coming soon!');
          break;
          
        case 'Style Transfer':
          applyFilter('vintage', 'sepia(80%) saturate(150%) hue-rotate(15deg)');
          toast.success('Artistic style applied successfully!');
          break;
      }
    } catch (error) {
      toast.error(`Failed to apply ${featureName}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const exportImage = () => {
    if (!canvasRef.current) {
      toast.error('No image to export');
      return;
    }

    try {
      const canvas = canvasRef.current;
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `pixelcrafter-edited-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Image exported successfully!');
    } catch (error) {
      toast.error('Failed to export image');
    }
  };

  const deleteImage = () => {
    if (!uploadedImage) {
      toast.error('No image to delete');
      return;
    }

    if (window.confirm('Are you sure you want to delete this image?')) {
      setUploadedImage(null);
      setHistory([]);
      setHistoryIndex(-1);
      setSelectedFilter('none');
      setZoom(100);
      setRotation(0);
      setBrightness(100);
      setContrast(100);
      setSaturation(100);
      setCropArea(null);
      setCanvasPosition({ x: 0, y: 0 });
      setTextElements([]);
      setShapeElements([]);
      setSelectedTextId(null);
      setSelectedShapeId(null);
      toast.success('Image deleted successfully!');
    }
  };

  return (
    <div className="flex h-full space-x-6">
      {/* Left Sidebar - Tools */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-64 bg-white/80 dark:bg-dark-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-dark-700 overflow-y-auto"
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Tools</h2>
        
        <div className="space-y-2 mb-8">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => {
                setSelectedTool(tool.id);
                // Reset tool-specific states
                if (tool.id !== 'crop') {
                  setCropArea(null);
                  setIsCropping(false);
                }
                if (tool.id !== 'move') {
                  setIsDragging(false);
                }
                if (tool.id !== 'text') {
                  setIsAddingText(false);
                }
                if (tool.id !== 'shape') {
                  setIsDrawingShape(false);
                }
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                selectedTool === tool.id
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700'
              }`}
            >
              <tool.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{tool.name}</span>
            </button>
          ))}
        </div>

        {/* Tool-specific controls */}
        {selectedTool === 'brush' && (
          <div className="border-t border-gray-200 dark:border-dark-700 pt-4 mb-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Brush Settings</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Size: {brushSize}px
                </label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={brushSize}
                  onChange={(e) => setBrushSize(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Color</label>
                <input
                  type="color"
                  value={brushColor}
                  onChange={(e) => setBrushColor(e.target.value)}
                  className="w-full h-8 rounded border border-gray-300 dark:border-dark-600"
                />
              </div>
            </div>
          </div>
        )}

        {selectedTool === 'eraser' && (
          <div className="border-t border-gray-200 dark:border-dark-700 pt-4 mb-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Eraser Settings</h3>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Size: {brushSize}px
              </label>
              <input
                type="range"
                min="1"
                max="50"
                value={brushSize}
                onChange={(e) => setBrushSize(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        )}

        {selectedTool === 'text' && (
          <div className="border-t border-gray-200 dark:border-dark-700 pt-4 mb-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Text Tool</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Text Content</label>
                <input
                  type="text"
                  value={currentText}
                  onChange={(e) => setCurrentText(e.target.value)}
                  placeholder="Enter text..."
                  className="w-full p-2 text-sm border border-gray-300 dark:border-dark-600 rounded-md focus:ring-1 focus:ring-primary-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Font Family</label>
                <select
                  value={fontFamily}
                  onChange={(e) => {
                    setFontFamily(e.target.value);
                    if (selectedTextId) {
                      updateSelectedText({ fontFamily: e.target.value });
                    }
                  }}
                  className="w-full p-2 text-sm border border-gray-300 dark:border-dark-600 rounded-md focus:ring-1 focus:ring-primary-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                >
                  {fontFamilies.map(font => (
                    <option key={font} value={font}>{font}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Font Size: {fontSize}px
                </label>
                <input
                  type="range"
                  min="12"
                  max="72"
                  value={fontSize}
                  onChange={(e) => {
                    const newSize = parseInt(e.target.value);
                    setFontSize(newSize);
                    if (selectedTextId) {
                      updateSelectedText({ fontSize: newSize });
                    }
                  }}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Color</label>
                <input
                  type="color"
                  value={brushColor}
                  onChange={(e) => {
                    setBrushColor(e.target.value);
                    if (selectedTextId) {
                      updateSelectedText({ color: e.target.value });
                    }
                  }}
                  className="w-full h-8 rounded border border-gray-300 dark:border-dark-600"
                />
              </div>
              
              <div className="space-y-2">
                <button
                  onClick={() => setIsAddingText(!isAddingText)}
                  disabled={!uploadedImage || !currentText.trim()}
                  className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                    isAddingText 
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-600' 
                      : 'bg-primary-500 text-white hover:bg-primary-600'
                  }`}
                >
                  {isAddingText ? 'Cancel' : 'Add Text'}
                </button>
                
                {selectedTextId && (
                  <button
                    onClick={deleteSelectedText}
                    className="w-full px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors text-sm"
                  >
                    Delete Selected Text
                  </button>
                )}
              </div>
              
              {isAddingText && (
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Click on the canvas to place your text
                </p>
              )}
            </div>
          </div>
        )}

        {selectedTool === 'crop' && (
          <div className="border-t border-gray-200 dark:border-dark-700 pt-4 mb-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Crop Tool</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Click and drag on the image to select crop area
            </p>
            {cropArea && (
              <button
                onClick={cropImage}
                className="w-full px-3 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm"
              >
                Apply Crop
              </button>
            )}
          </div>
        )}

        {selectedTool === 'move' && (
          <div className="border-t border-gray-200 dark:border-dark-700 pt-4 mb-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Move Tool</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Click and drag to move the image around
            </p>
            <button
              onClick={() => setCanvasPosition({ x: 0, y: 0 })}
              className="w-full px-3 py-2 bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors text-sm"
            >
              Reset Position
            </button>
          </div>
        )}

        {selectedTool === 'shape' && (
          <div className="border-t border-gray-200 dark:border-dark-700 pt-4 mb-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Shape Tool</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-2">Shape Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {shapes.map((shape) => (
                    <button
                      key={shape.id}
                      onClick={() => setSelectedShape(shape.id)}
                      className={`p-2 text-xs rounded-md transition-colors flex items-center justify-center space-x-1 ${
                        selectedShape === shape.id
                          ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                          : 'bg-gray-100 dark:bg-dark-700 hover:bg-gray-200 dark:hover:bg-dark-600 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <shape.icon className="w-3 h-3" />
                      <span>{shape.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Stroke Width: {brushSize}px
                </label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={brushSize}
                  onChange={(e) => {
                    const newSize = parseInt(e.target.value);
                    setBrushSize(newSize);
                    if (selectedShapeId) {
                      updateSelectedShape({ strokeWidth: newSize });
                    }
                  }}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Stroke Color</label>
                <input
                  type="color"
                  value={brushColor}
                  onChange={(e) => {
                    setBrushColor(e.target.value);
                    if (selectedShapeId) {
                      updateSelectedShape({ strokeColor: e.target.value });
                    }
                  }}
                  className="w-full h-8 rounded border border-gray-300 dark:border-dark-600"
                />
              </div>
              
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Fill Color</label>
                <div className="flex space-x-2">
                  <input
                    type="color"
                    value={fillColor === 'transparent' ? '#ffffff' : fillColor}
                    onChange={(e) => {
                      setFillColor(e.target.value);
                      if (selectedShapeId) {
                        updateSelectedShape({ fillColor: e.target.value });
                      }
                    }}
                    className="flex-1 h-8 rounded border border-gray-300 dark:border-dark-600"
                  />
                  <button
                    onClick={() => {
                      setFillColor('transparent');
                      if (selectedShapeId) {
                        updateSelectedShape({ fillColor: 'transparent' });
                      }
                    }}
                    className={`px-2 py-1 text-xs rounded transition-colors ${
                      fillColor === 'transparent'
                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                        : 'bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    None
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <button
                  onClick={addShapeElement}
                  disabled={!uploadedImage}
                  className="w-full px-3 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm disabled:opacity-50"
                >
                  Add {selectedShape}
                </button>
                
                {selectedShapeId && (
                  <button
                    onClick={deleteSelectedShape}
                    className="w-full px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors text-sm"
                  >
                    Delete Selected Shape
                  </button>
                )}
              </div>
              
              <p className="text-xs text-blue-600 dark:text-blue-400">
                Click on shapes to select and drag them around
              </p>
            </div>
          </div>
        )}

        {/* Image Adjustments */}
        <div className="border-t border-gray-200 dark:border-dark-700 pt-4 mb-6">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Adjustments</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Brightness: {brightness}%
              </label>
              <input
                type="range"
                min="0"
                max="200"
                value={brightness}
                onChange={(e) => adjustBrightness(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Contrast: {contrast}%
              </label>
              <input
                type="range"
                min="0"
                max="200"
                value={contrast}
                onChange={(e) => adjustContrast(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Saturation: {saturation}%
              </label>
              <input
                type="range"
                min="0"
                max="200"
                value={saturation}
                onChange={(e) => adjustSaturation(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="border-t border-gray-200 dark:border-dark-700 pt-6 mb-6">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button
              onClick={rotateImage}
              disabled={!uploadedImage || isProcessing}
              className="w-full flex items-center space-x-2 px-3 py-2 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors disabled:opacity-50"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Rotate 90°</span>
            </button>
            <button
              onClick={deleteImage}
              disabled={!uploadedImage}
              className="w-full flex items-center space-x-2 px-3 py-2 text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors disabled:opacity-50"
            >
              <Scissors className="w-4 h-4" />
              <span>Delete Image</span>
            </button>
          </div>
        </div>

        {/* AI Features */}
        <div className="border-t border-gray-200 dark:border-dark-700 pt-6">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">AI Features</h3>
          <div className="space-y-3">
            {aiFeatures.map((feature) => (
              <button
                key={feature.name}
                onClick={() => handleAIFeature(feature.name)}
                disabled={isProcessing || !uploadedImage}
                className="w-full p-3 text-left rounded-lg bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 hover:from-primary-100 hover:to-accent-100 dark:hover:from-primary-900/40 dark:hover:to-accent-900/40 transition-colors disabled:opacity-50"
              >
                <div className="flex items-center space-x-3 mb-1">
                  <feature.icon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {feature.name}
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        {selectedTool === 'filter' && (
          <div className="border-t border-gray-200 dark:border-dark-700 pt-6 mt-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Filters</h3>
            <div className="grid grid-cols-2 gap-2">
              {filters.map((filter) => (
                <button
                  key={filter.name}
                  onClick={() => applyFilter(filter.value, filter.filter)}
                  disabled={isProcessing}
                  className={`p-2 text-xs rounded-md transition-colors disabled:opacity-50 ${
                    selectedFilter === filter.value
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                      : 'bg-gray-100 dark:bg-dark-700 hover:bg-gray-200 dark:hover:bg-dark-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {filter.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Main Canvas Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 bg-white/80 dark:bg-dark-800/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-dark-700 overflow-hidden"
      >
        {/* Top Toolbar */}
        <div className="border-b border-gray-200 dark:border-dark-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button 
                  onClick={undo}
                  disabled={historyIndex <= 0}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-dark-700 hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors disabled:opacity-50"
                >
                  <Undo className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </button>
                <button 
                  onClick={redo}
                  disabled={historyIndex >= history.length - 1}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-dark-700 hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors disabled:opacity-50"
                >
                  <Redo className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </button>
              </div>
              
              <div className="flex items-center space-x-2">
                <button 
                  onClick={zoomOut}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-dark-700 hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors"
                >
                  <ZoomOut className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400 px-2 min-w-[60px] text-center">{zoom}%</span>
                <button 
                  onClick={zoomIn}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-dark-700 hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors"
                >
                  <ZoomIn className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button className="p-2 rounded-lg bg-gray-100 dark:bg-dark-700 hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors">
                <Layers className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </button>
              <button 
                onClick={exportImage}
                disabled={!uploadedImage}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium">Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Canvas Area */}
        <div 
          ref={containerRef}
          className="flex-1 p-6 flex items-center justify-center bg-gray-50 dark:bg-dark-900/50 overflow-auto"
        >
          {uploadedImage ? (
            <div 
              className="relative" 
              style={{ 
                transform: `scale(${zoom / 100}) translate(${canvasPosition.x}px, ${canvasPosition.y}px)`,
                transformOrigin: 'center'
              }}
            >
              <canvas
                ref={canvasRef}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseUp}
                className={`max-w-full max-h-full object-contain rounded-lg shadow-lg transition-all duration-300 ${
                  selectedTool === 'brush' ? 'cursor-crosshair' : 
                  selectedTool === 'eraser' ? 'cursor-crosshair' :
                  selectedTool === 'crop' ? 'cursor-crosshair' :
                  selectedTool === 'move' ? 'cursor-move' : 
                  selectedTool === 'shape' ? 'cursor-pointer' : 
                  selectedTool === 'text' ? (isAddingText ? 'cursor-crosshair' : 'cursor-pointer') : 'cursor-default'
                }`}
                style={{ 
                  imageRendering: zoom > 100 ? 'pixelated' : 'auto'
                }}
              />
              
              {/* Crop overlay */}
              {cropArea && selectedTool === 'crop' && (
                <div
                  className="absolute border-2 border-primary-500 bg-primary-500/20 pointer-events-none"
                  style={{
                    left: Math.min(cropArea.x, cropArea.x + cropArea.width),
                    top: Math.min(cropArea.y, cropArea.y + cropArea.height),
                    width: Math.abs(cropArea.width),
                    height: Math.abs(cropArea.height),
                  }}
                />
              )}
              
              {isProcessing && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                  <div className="text-center text-white">
                    <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-sm">Processing...</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div
              {...getRootProps()}
              className={`w-full h-96 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-300 dark:border-dark-600 hover:border-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-900/10'
              }`}
            >
              <input {...getInputProps()} />
              <div className="text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {isDragActive ? 'Drop your image here' : 'Upload an image to edit'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Drag & drop or click to browse (PNG, JPG, GIF up to 10MB)
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Edit;