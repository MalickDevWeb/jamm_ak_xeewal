import { Component, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Message {
  text: string;
  isUser: boolean;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent implements AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  isOpen = false;
  inputText = '';
  messages: Message[] = [
    { text: "Salam ! 👋 Je suis l'assistant virtuel de JÀMM AK XÉEWAL. Comment puis-je vous aider aujourd'hui ?", isUser: false }
  ];

  toggleChat() {
    this.isOpen = !this.isOpen;
  }

  closeChat() {
    this.isOpen = false;
  }

  sendMessage() {
    const text = this.inputText.trim();
    if (text) {
      this.messages.push({ text, isUser: true });
      this.inputText = '';
      
      // Fake typing delay
      setTimeout(() => {
        this.messages.push({
          text: "C'est noté ! Nos équipes vous répondront très bientôt. En attendant, n'hésitez pas à parcourir nos différents Pôles d'Action.",
          isUser: false
        });
      }, 1200);
    }
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.sendMessage();
    }
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch(err) { }
  }
}
